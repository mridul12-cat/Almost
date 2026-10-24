import { useEffect, useRef, useState } from 'react';
import { createDraft, type Draft, type Exhibit } from './model/types';
import { reconcileDraft, upsertExhibit } from './model/museumReducer';
import { suggestTitle } from './model/naming';
import { validateDraft } from './model/validation';
import { createMuseumStorage, EXHIBIT_PREFIX, SAVE_WARNING } from './storage/museumStorage';
import { useReducedMotion } from './hooks/useReducedMotion';
import { MuseumScene } from './components/MuseumScene';
import { ExhibitGallery } from './components/ExhibitGallery';
import { CreationPanel } from './components/CreationPanel';
import { ExhibitPlaque } from './components/ExhibitPlaque';
import { StatusNotice } from './components/StatusNotice';

const storage = createMuseumStorage(() => window.localStorage, () => window.sessionStorage);
function initialize() {
  const load = storage.load();
  const session = storage.readDraft();
  const reconciliation = reconcileDraft(session.draft, load.records);
  const draft = reconciliation === 'completed' ? null : session.draft;
  let records = load.records;
  if (draft?.phase === 'pending-save' && reconciliation === 'resume' && !Object.keys(validateDraft(draft)).length) {
    records = upsertExhibit(records, { schemaVersion: 1, id: draft.id, title: draft.title, description: draft.description, artifactType: draft.artifactType!, lightOn: false, createdAt: draft.placedAt! });
  }
  return { load, records, draft, reconciliation, draftError: session.error || '' };
}

export default function App() {
  const [initial] = useState(initialize);
  const [records, setRecords] = useState(initial.records);
  const recordsRef = useRef(records);
  const [draft, setDraft] = useState<Draft | null>(initial.draft);
  const draftRef = useRef(draft);
  const baselines = useRef(initial.load.baselines);
  const [saved, setSaved] = useState<Record<string, boolean>>(() => Object.fromEntries(initial.records.map(e => [e.id, !!initial.load.baselines[e.id]])));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [blocked, setBlocked] = useState(initial.load.blocked);
  const [loadWarning, setLoadWarning] = useState(initial.load.error || '');
  const [draftWarning, setDraftWarning] = useState(initial.draftError);
  const [message, setMessage] = useState('');
  const [panel, setPanel] = useState<'creation' | 'plaque' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealId, setRevealId] = useState<string | null>(null);
  const [playbackId, setPlaybackId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submissionGuard = useRef(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();
  const selected = records.find(e => e.id === selectedId);

  function updateRecords(next: Exhibit[]) { recordsRef.current = next; setRecords(next); }
  function writeDraft(next: Draft | null) {
    draftRef.current = next;
    setDraft(next);
    const result = next ? storage.writeDraft(next) : storage.clearDraft();
    if (!result.ok) setDraftWarning(result.error);
    else setDraftWarning('');
  }
  function updateDraft(changes: Partial<Draft>) {
    const current = draftRef.current;
    if (!current) return;
    writeDraft({ ...current, ...changes });
  }
  function persist(exhibit: Exhibit): boolean {
    if (blocked) {
      setSaved(current => ({ ...current, [exhibit.id]: false }));
      setErrors(current => ({ ...current, [exhibit.id]: SAVE_WARNING }));
      return false;
    }
    if (initial.reconciliation === 'conflict' && initial.draft?.id === exhibit.id) {
      setSaved(current => ({ ...current, [exhibit.id]: false }));
      setErrors(current => ({ ...current, [exhibit.id]: 'An earlier draft conflicts with the saved exhibit. Both have been kept; this page will not overwrite the saved one.' }));
      return false;
    }
    const result = storage.save(exhibit, baselines.current[exhibit.id] ?? null);
    setSaved(current => ({ ...current, [exhibit.id]: result.ok }));
    if (result.ok) {
      baselines.current[exhibit.id] = result.baseline;
      setErrors(current => ({ ...current, [exhibit.id]: '' }));
      const pending = draftRef.current;
      if (pending?.id === exhibit.id && pending.phase === 'pending-save' && pending.title === exhibit.title && pending.description === exhibit.description && pending.artifactType === exhibit.artifactType) writeDraft(null);
      return true;
    }
    setErrors(current => ({ ...current, [exhibit.id]: result.error }));
    if (result.reason === 'blocked') { setBlocked(true); setLoadWarning(result.error); }
    return false;
  }
  function beginCreation() {
    if (!draftRef.current) writeDraft(createDraft(crypto.randomUUID()));
    setMessage('');
    setPanel('creation');
  }
  function nextStep() {
    const current = draftRef.current;
    if (!current) return;
    const errors = validateDraft(current);
    if (current.step === 'remember' && !errors.description) writeDraft({ ...current, step: 'name', title: current.titleInitialized ? current.title : suggestTitle(current.description), titleInitialized: true });
    else if (current.step === 'name' && !errors.title && !errors.description) updateDraft({ step: 'form' });
  }
  function finishReveal(id: string) {
    setRevealId(null);
    setBusy(false);
    submissionGuard.current = false;
    setSelectedId(id);
    setPanel('plaque');
  }
  function place() {
    const current = draftRef.current;
    if (!current || submissionGuard.current || Object.keys(validateDraft(current)).length) return;
    if (initial.reconciliation === 'conflict' && initial.draft?.id === current.id) {
      setDraftWarning('This draft differs from an already saved exhibit. Both versions are kept. Placement is blocked so the saved exhibit is not replaced.');
      return;
    }
    submissionGuard.current = true;
    setBusy(true);
    const existing = recordsRef.current.find(e => e.id === current.id);
    const record: Exhibit = { schemaVersion: 1, id: current.id, title: current.title, description: current.description, artifactType: current.artifactType!, lightOn: existing?.lightOn ?? false, createdAt: existing?.createdAt ?? current.placedAt ?? new Date().toISOString() };
    writeDraft({ ...current, phase: 'pending-save', placedAt: record.createdAt });
    updateRecords(upsertExhibit(recordsRef.current, record));
    const didSave = persist(record);
    setMessage(didSave ? 'Your exhibit has found its place.' : SAVE_WARNING);
    setPanel(null);
    setSelectedId(record.id);
    if (!didSave || current.phase === 'pending-save' || reduced) finishReveal(record.id);
    else {
      setRevealId(record.id);
      revealTimer.current = setTimeout(() => finishReveal(record.id), 1900);
    }
  }
  function closePanel() {
    setPanel(null);
    setPlaybackId(null);
    if (playbackTimer.current) clearTimeout(playbackTimer.current);
    if (selectedId) requestAnimationFrame(() => document.getElementById(`artifact-${selectedId}`)?.focus());
  }
  function select(id: string) {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    setRevealId(null);
    setBusy(false);
    submissionGuard.current = false;
    setSelectedId(id);
    setPlaybackId(null);
    if (playbackTimer.current) clearTimeout(playbackTimer.current);
    setMessage('');
    setPanel('plaque');
  }
  function replay(id: string) {
    if (playbackId) return;
    setMessage('A little moment, remembered.');
    if (!reduced) {
      setPlaybackId(id);
      playbackTimer.current = setTimeout(() => setPlaybackId(null), 2500);
    }
  }
  function light(id: string, lightOn: boolean, animate = false) {
    const record = recordsRef.current.find(e => e.id === id);
    if (!record) return;
    const pending = draftRef.current;
    const changed = pending?.id === id && pending.phase === 'pending-save'
      ? { ...record, title: pending.title, description: pending.description, artifactType: pending.artifactType ?? record.artifactType, lightOn }
      : { ...record, lightOn };
    updateRecords(upsertExhibit(recordsRef.current, changed));
    const didSave = persist(changed);
    setMessage(didSave ? (lightOn ? 'A little light, left on.' : 'The light is off. Your beginning is still here.') : 'Your light has changed here, but could not be saved for your next visit.');
    if (animate) replay(id);
  }
  function retry(exhibit: Exhibit) {
    let latest = recordsRef.current.find(e => e.id === exhibit.id) ?? exhibit;
    const pending = draftRef.current;
    if (pending?.id === exhibit.id && pending.phase === 'pending-save') {
      if (Object.keys(validateDraft(pending)).length) { setPanel('creation'); return; }
      latest = { ...latest, title: pending.title, description: pending.description, artifactType: pending.artifactType! };
      updateRecords(upsertExhibit(recordsRef.current, latest));
    }
    if (persist(latest)) setMessage('Your exhibit has found its place.');
  }
  function recheck() {
    const result = storage.load();
    setBlocked(result.blocked);
    setLoadWarning(result.error || '');
    const current = recordsRef.current;
    const merged = [...current];
    for (const exhibit of result.records) {
      if (!current.some(e => e.id === exhibit.id)) { merged.push(exhibit); baselines.current[exhibit.id] = result.baselines[exhibit.id]; setSaved(prev => ({ ...prev, [exhibit.id]: true })); }
    }
    updateRecords(merged);
    setMessage(result.blocked ? '' : 'The saved collection can be read again. Use Retry saving for any temporary exhibit.');
  }
  useEffect(() => {
    if (initial.reconciliation === 'completed') {
      const result = storage.clearDraft();
      if (!result.ok) setDraftWarning(result.error);
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key.startsWith(EXHIBIT_PREFIX)) {
        setMessage('The saved collection changed in another tab. Local words remain here; saving checks for conflicts.');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener('storage', onStorage); if (revealTimer.current) clearTimeout(revealTimer.current); if (playbackTimer.current) clearTimeout(playbackTimer.current); };
  }, [initial]);
  useEffect(() => {
    if (!reduced) return;
    if (revealTimer.current) clearTimeout(revealTimer.current);
    if (playbackTimer.current) clearTimeout(playbackTimer.current);
    setPlaybackId(null);
    if (revealId) finishReveal(revealId);
  }, [reduced, revealId]);

  return <div className="museum-app">
    <a className="skip-link" href="#museum">Skip to museum</a>
    <header className="site-header"><a className="wordmark" href="#museum" aria-label="Almost museum"><svg viewBox="0 0 34 34" aria-hidden="true"><path d="M25 5A13 13 0 1 0 29 25 14 14 0 0 1 25 5Z"/><path d="m22 13 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/></svg><span>almost<span className="wordmark-subtitle">The museum of unfinished things</span></span></a><span className="header-note"><span aria-hidden="true">✦</span> No endings required.</span></header>
    <MuseumScene count={records.length} hasDraft={!!draft} onCreate={beginCreation} placing={!!revealId} remembering={!!playbackId} lightCount={records.filter(e => e.lightOn).length} onSkipReveal={() => {if (revealId) {if (revealTimer.current) clearTimeout(revealTimer.current); finishReveal(revealId);}}}><ExhibitGallery records={records} selectedId={selectedId} revealId={revealId} playbackId={playbackId} saved={saved} onSelect={select}/></MuseumScene>
    <StatusNotice blocked={blocked} warning={loadWarning} draftWarning={draftWarning || (initial.reconciliation === 'conflict' ? 'An earlier draft differs from its saved exhibit. Both have been retained; the saved version will not be overwritten.' : '')} message={message} onRecheck={recheck}/>
    <footer className="site-footer"><span>Kept with care. By you, and a very small cat.</span><span className="footer-storage">Saved in this browser when available.<br/>Clearing browser data may remove your collection.</span><span className="footer-star" aria-hidden="true">☾</span></footer>
    {panel === 'creation' && draft && <CreationPanel draft={draft} busy={busy} onChange={updateDraft} onNext={nextStep} onPlace={place} onClose={closePanel} notice={blocked ? 'This collection cannot currently be saved. Your words will remain here for now, and may disappear after a reload.' : draftWarning}/>}
    {panel === 'plaque' && selected && <ExhibitPlaque exhibit={selected} playing={playbackId === selected.id} saved={!!saved[selected.id]} error={errors[selected.id] || (!saved[selected.id] ? SAVE_WARNING : '')} blocked={blocked} canEdit={draft?.id === selected.id} onClose={closePanel} onLight={(on, animate) => light(selected.id, on, animate)} onReplay={() => replay(selected.id)} onRetry={() => retry(selected)} onEdit={() => setPanel('creation')}/>}
  </div>;
}

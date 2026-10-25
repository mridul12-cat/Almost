import { useEffect, useRef, useState } from 'react';
import { createJournalDraft, JOURNAL_BODY_LIMIT, JOURNAL_TITLE_LIMIT, validateJournalDraft, type JournalDraft, type JournalEntry } from '../model/journal';
import { codePointLength } from '../model/validation';
import { createJournalStorage, JOURNAL_PREFIX } from '../storage/journalStorage';
import { PanelDialog } from './PanelDialog';

const storage = createJournalStorage(() => window.localStorage, () => window.sessionStorage);
function samePage(draft: JournalDraft, entry: JournalEntry) {
  return draft.id === entry.id && draft.title === entry.title && draft.body === entry.body && draft.createdAt === entry.createdAt && draft.modifiedAt === entry.updatedAt && draft.timeZone === entry.timeZone;
}
function sortPages(entries: JournalEntry[]) { return [...entries].sort((a,b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id)); }
function initialize() {
  const load = storage.load();
  const session = storage.readDraft();
  const completed = session.draft && load.entries.some(entry => samePage(session.draft!, entry));
  return { load, draft: completed ? null : session.draft, draftError: session.error || '', cleanupId: completed ? session.draft!.id : null };
}
function zone() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; } }
export function journalDate(value: string, timeZone: string) {
  return new Intl.DateTimeFormat(undefined, { year:'numeric', month:'long', day:'numeric', hour:'numeric', minute:'2-digit', second:'2-digit', timeZoneName:'short', timeZone }).format(new Date(value));
}
function pageName(entry: {title: string}) { return entry.title.trim() ? entry.title : 'An untitled memory'; }

/** Kept mounted outside the room so closing a book or leaving a room cannot discard its words. */
export function MemoryJournal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [initial] = useState(initialize);
  const [entries, setEntries] = useState(initial.load.entries);
  const entriesRef = useRef(entries);
  const baselines = useRef(initial.load.baselines);
  const [saved, setSaved] = useState<Record<string, boolean>>(() => Object.fromEntries(initial.load.entries.map(entry => [entry.id, true])));
  const [draft, setDraft] = useState<JournalDraft | null>(initial.draft);
  const draftRef = useRef(draft);
  const [selectedId, setSelectedId] = useState<string | null>(initial.draft?.id ?? initial.load.entries[0]?.id ?? null);
  const [view, setView] = useState<'write'|'read'>(initial.draft ? 'write' : 'read');
  const [indexPage, setIndexPage] = useState(0);
  const [showIndex, setShowIndex] = useState(false);
  const [warning, setWarning] = useState(initial.load.error || '');
  const [draftWarning, setDraftWarning] = useState(initial.draftError);
  const [saveError, setSaveError] = useState('');
  const [message, setMessage] = useState('');
  const guard = useRef(false);
  const selected = entries.find(entry => entry.id === selectedId);
  const errors = draft ? validateJournalDraft(draft) : {};
  const pages = Math.max(1, Math.ceil(entries.length / 5));
  const page = Math.min(indexPage, pages - 1);
  const focusPage = () => requestAnimationFrame(() => document.getElementById('journal-page-heading')?.focus());
  function updateEntries(next: JournalEntry[]) { entriesRef.current = next; setEntries(next); }
  function keepDraft(next: JournalDraft) {
    draftRef.current = next; setDraft(next);
    const result = storage.writeDraft(next);
    setDraftWarning(result.ok ? '' : result.error || 'Your open page remains here, but could not be saved for a reload.');
  }
  function startPage() {
    if (!draftRef.current) keepDraft(createJournalDraft(crypto.randomUUID(), zone()));
    setSelectedId(draftRef.current!.id); setView('write'); setShowIndex(false); setMessage(''); focusPage();
  }
  function change(fields: Partial<Pick<JournalDraft,'title'|'body'>>) {
    const current = draftRef.current;
    if (current) { keepDraft({...current, ...fields, modifiedAt:null}); setMessage(''); }
  }
  function editPage(entry: JournalEntry) {
    if (draftRef.current && draftRef.current.id !== entry.id) return;
    if (!draftRef.current) keepDraft({schemaVersion:1,id:entry.id,title:entry.title,body:entry.body,createdAt:entry.createdAt,modifiedAt:null,timeZone:entry.timeZone,baseline:baselines.current[entry.id] ?? null});
    setView('write'); setShowIndex(false); setSaveError(''); setMessage(''); focusPage();
  }
  function selectPage(entry: JournalEntry) { setSelectedId(entry.id); setView('read'); setShowIndex(false); setMessage(''); focusPage(); }
  function savePage() {
    const current = draftRef.current;
    if (!current || guard.current || Object.keys(validateJournalDraft(current)).length) return;
    guard.current = true;
    try {
      const now = new Date(Math.max(Date.now(), current.createdAt ? Date.parse(current.createdAt) : 0)).toISOString();
      const pending = {...current,createdAt:current.createdAt ?? now, modifiedAt:current.modifiedAt ?? now};
      keepDraft(pending);
      const entry: JournalEntry = {schemaVersion:1,id:pending.id,title:pending.title,body:pending.body,createdAt:pending.createdAt,updatedAt:pending.modifiedAt,timeZone:pending.timeZone};
      const result = storage.save(entry, pending.baseline);
      // Conflicting saved words stay visible; the pending version remains in the editor.
      if (result.ok || result.reason !== 'conflict') {
        updateEntries(sortPages([...entriesRef.current.filter(item => item.id !== entry.id), entry]));
        setSaved(flags => ({...flags,[entry.id]:result.ok}));
      }
      setSelectedId(entry.id);
      if (!result.ok) {
        setSaveError(result.error); setMessage('');
        if (result.reason === 'blocked') setWarning(result.error);
        return;
      }
      baselines.current[entry.id] = result.baseline;
      draftRef.current = null; setDraft(null);
      const cleared = storage.clearDraft(entry.id);
      setDraftWarning(cleared.ok ? '' : cleared.error || 'Your memory is saved, but the open-page draft could not be cleared.');
      setSaveError(''); setMessage('Your memory has found a page. Saved in this browser.'); setView('read');
      setIndexPage(Math.floor(entriesRef.current.findIndex(item => item.id === entry.id) / 5));
      focusPage();
    } finally { guard.current = false; }
  }
  function recheck() {
    const result = storage.load();
    const merged = [...entriesRef.current];
    for (const entry of result.entries) {
      if (draftRef.current?.id === entry.id) continue;
      const index = merged.findIndex(item => item.id === entry.id);
      if (index >= 0) merged[index] = entry; else merged.push(entry);
      baselines.current[entry.id] = result.baselines[entry.id];
      setSaved(flags => ({...flags,[entry.id]:true}));
    }
    updateEntries(sortPages(merged));
    setWarning(result.error || '');
    setMessage(result.blocked ? '' : 'The saved journal can be read again. Retry any open page when you are ready.');
  }
  useEffect(() => {
    if (initial.cleanupId) {
      const result = storage.clearDraft(initial.cleanupId);
      if (!result.ok) setDraftWarning(result.error || 'A completed open-page draft could not be cleared.');
    }
    const changed = (event: StorageEvent) => {
      if (event.key === null || event.key.startsWith(JOURNAL_PREFIX)) setWarning('The journal changed in another tab. Your open words remain here. Check saved pages before continuing.');
    };
    window.addEventListener('storage',changed);
    return () => window.removeEventListener('storage',changed);
  },[initial]);
  if (!open) return null;
  return <PanelDialog title="The Memory Journal" kind="journal" onClose={onClose}>
    <div className="journal-toolbar"><span><span aria-hidden="true">❀</span> Moonseed Conservatory</span><button className="text-button" onClick={startPage} disabled={view === 'write' && !!draft}>{draft ? 'Continue open page' : 'New memory'} <span aria-hidden="true">＋</span></button></div>
    <p className="journal-storage-note">Saved in this browser. Clearing its data removes saved pages.</p>
    {warning && <div className="journal-warning" role="status"><p>{warning}</p><button className="text-button" onClick={recheck}>Check saved pages</button></div>}
    {draftWarning && <p className="journal-warning" role="status">{draftWarning}</p>}
    <button className="journal-index-toggle text-button" aria-expanded={showIndex} aria-controls="journal-index" onClick={() => setShowIndex(show => !show)}>{showIndex ? 'Close page index' : `Browse memories (${entries.length})`} <span aria-hidden="true">⌄</span></button>
    <div className="journal-layout">
      <aside id="journal-index" className={`journal-index ${showIndex ? 'is-open' : ''}`} aria-label="Memory pages"><h3>Your pages</h3><span className="journal-index-caption">Newest memories first.</span>
        {entries.length ? <ol>{entries.slice(page * 5,page * 5 + 5).map(entry => <li key={entry.id}><button className="journal-page-link" aria-label={`Read memory: ${pageName(entry)}`} aria-pressed={selectedId === entry.id} onClick={() => selectPage(entry)}><strong>{pageName(entry)}</strong><time dateTime={entry.createdAt}>{journalDate(entry.createdAt,entry.timeZone)}</time>{!saved[entry.id] && <span className="journal-temporary">Not saved yet</span>}</button></li>)}</ol> : <p className="journal-index-empty">A few blank pages.<br/>All the room you need.</p>}
        {pages > 1 && <nav className="journal-pagination" aria-label="Journal page browsing"><button className="icon-button" aria-label="Previous memory pages" disabled={page === 0} onClick={() => setIndexPage(page - 1)}>←</button><span>{page * 5 + 1}–{Math.min(entries.length,(page + 1) * 5)} of {entries.length}</span><button className="icon-button" aria-label="Next memory pages" disabled={page === pages - 1} onClick={() => setIndexPage(page + 1)}>→</button></nav>}
      </aside>
      <div className="journal-paper">
        <span className="journal-pressed-fern" aria-hidden="true">❧</span>
        {view === 'write' && draft ? <form onSubmit={event => {event.preventDefault(); savePage();}}>
          <span className="journal-kicker">A little space, just for your words</span><h3 id="journal-page-heading" tabIndex={-1}>{draft.baseline ? 'Revisiting a memory.' : 'A page of your own.'}</h3>
          {draft.createdAt ? <p className="journal-date">Recorded <time dateTime={draft.createdAt}>{journalDate(draft.createdAt,draft.timeZone)}</time></p> : <p className="journal-date">The date and time are recorded when you first save.</p>}
          <div className="field"><label htmlFor="journal-entry-title">A name for this memory <span>(optional)</span></label><input id="journal-entry-title" value={draft.title} onChange={event => change({title:event.target.value})} aria-describedby="journal-title-help" aria-invalid={!!errors.title}/><div className="field-help" id="journal-title-help"><span>{errors.title || 'Leave it unnamed if you like.'}</span><span>{codePointLength(draft.title)} / {JOURNAL_TITLE_LIMIT}</span></div></div>
          <div className="field journal-writing-field"><label htmlFor="journal-body">Your memory</label><textarea id="journal-body" rows={9} value={draft.body} placeholder="A little moment. A place you remember. Something you would like to keep…" onChange={event => change({body:event.target.value})} aria-describedby="journal-body-help" aria-invalid={!!errors.body}/><div className="field-help" id="journal-body-help"><span>{errors.body || 'Your words, exactly as you write them.'}</span><span>{codePointLength(draft.body)} / {JOURNAL_BODY_LIMIT.toLocaleString()}</span></div></div>
          {saveError && <p className="journal-warning" role="status">{saveError} Your words remain on this open page.</p>}
          <div className="panel-actions journal-actions"><button type="button" className="text-button" onClick={onClose}>Close for now</button><button className="primary-button" type="submit" disabled={Object.keys(errors).length > 0}>{saveError ? 'Retry saving' : draft.baseline ? 'Save changes' : 'Keep this memory'} <span aria-hidden="true">❧</span></button></div>
          <p className="journal-draft-note">Closing keeps this open page for the current browser session when storage is available.</p>
        </form> : selected ? <article>
          <span className="journal-kicker">A memory, kept gently</span><h3 id="journal-page-heading" className="journal-entry-title" tabIndex={-1}>{pageName(selected)}</h3>
          <p className="journal-date">Recorded <time dateTime={selected.createdAt}>{journalDate(selected.createdAt,selected.timeZone)}</time></p>
          {selected.updatedAt !== selected.createdAt && <p className="journal-date journal-updated">Updated <time dateTime={selected.updatedAt}>{journalDate(selected.updatedAt,selected.timeZone)}</time></p>}
          <div className="journal-read-actions"><span className={`journal-save-label ${saved[selected.id] ? '' : 'journal-temporary'}`}>{saved[selected.id] ? 'Saved in this browser' : 'This version is not saved yet'}</span><button className="text-button" disabled={!!draft && draft.id !== selected.id} onClick={() => editPage(selected)}>{draft?.id === selected.id ? 'Continue editing & retry' : 'Edit this memory'}</button></div>
          {draft && draft.id !== selected.id && <p className="journal-draft-note">An open page is waiting. Continue it before editing another memory.</p>}
          <p className="journal-entry-body">{selected.body}</p><span className="journal-page-flourish" aria-hidden="true">— ❧ —</span>
        </article> : <div className="journal-welcome"><span className="journal-kicker">The glasshouse keeps a little book</span><h3 id="journal-page-heading" tabIndex={-1}>A few words,<br/>kept gently.</h3><p>A place for a moment you would like to remember. No perfect words needed.</p><span className="journal-welcome-leaf" aria-hidden="true">❧</span><button className="primary-button" onClick={startPage}>Write a memory <span aria-hidden="true">✎</span></button></div>}
      </div>
    </div>
    <div className="journal-message" role="status" aria-live="polite">{message}</div>
  </PanelDialog>;
}

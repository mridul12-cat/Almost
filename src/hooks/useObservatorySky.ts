import { useEffect, useRef, useState } from 'react';
import type { Exhibit } from '../model/types';
import { codePointLength } from '../model/validation';
import { makeThread, universeGroups, type UniverseMap } from '../model/universe';
import { createUniverseStorage, serializeUniverse, UNIVERSE_KEY } from '../storage/universeStorage';

/** Lives with MuseumScene, so room trips cannot discard a temporary sky or open name. */
export function useObservatorySky(records: Exhibit[], savedExhibits: Record<string, boolean>) {
  const [initial] = useState(() => {
    const storage = createUniverseStorage(() => window.localStorage);
    return { storage, ...storage.load() };
  });
  const [map, setMap] = useState(initial.map);
  const mapRef = useRef(map);
  const baseline = useRef(initial.baseline);
  const unreadable = useRef(initial.blocked);
  const previousOwnWrites = useRef<UniverseMap[]>([]);
  const [warning, setWarning] = useState(initial.error || '');
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const [message, setMessage] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fromId, setFromId] = useState<string | null>(null);
  const [toId, setToId] = useState<string | null>(null);
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [recentThread, setRecentThread] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);
  const recordsRef = useRef(records);
  const savedRef = useRef(savedExhibits);
  useEffect(() => { recordsRef.current = records; savedRef.current = savedExhibits; }, [records, savedExhibits]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key === UNIVERSE_KEY || event.key === null) setWarning('The saved sky changed in another tab. Your current sky and open names remain here. Check the saved sky before continuing.');
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);

  const stars = [...records].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id));
  const groups = universeGroups(map, stars.map(star => star.id));
  const selected = stars.find(star => star.id === selectedId) || null;
  const group = groups.find(item => item.starIds.includes(selectedId || '')) || null;
  const groupDrafts = group ? Object.entries(nameDrafts).filter(([anchor]) => group.starIds.includes(anchor)) : [];
  const activeNameAnchor = group ? (groupDrafts.find(([anchor]) => anchor === group.id)?.[0] || groupDrafts[0]?.[0] || group.id) : null;
  const nameValue = activeNameAnchor && Object.hasOwn(nameDrafts, activeNameAnchor) ? nameDrafts[activeNameAnchor] : group?.names.length === 1 ? group.names[0].text : '';
  const nameError = codePointLength(nameValue) > 100 ? 'Keep the name within 100 characters. Your words are still here.' : '';
  const pair = makeThread(fromId || '', toId || '');
  const alreadyConnected = !!pair && map.edges.some(edge => edge.id === pair.id);
  const missingThreads = map.edges.some(edge => !stars.some(star => star.id === edge.a) || !stars.some(star => star.id === edge.b));

  function update(next: UniverseMap) { mapRef.current = next; setMap(next); }
  function persist(next: UniverseMap) {
    // Do not promise a durable connection to an exhibit that exists only in this page.
    const usesTemporaryStar = next.edges.some(edge => [edge.a, edge.b].some(id => recordsRef.current.some(star => star.id === id) && !savedRef.current[id]));
    if (usesTemporaryStar) {
      dirtyRef.current = true; setDirty(true);
      setWarning('A thread uses an exhibit that is not saved yet. This sky stays here for now and may disappear after a reload. Save that exhibit in the Main Hall, then retry here.');
      return false;
    }
    const result = initial.storage.save(next, baseline.current, previousOwnWrites.current);
    if (result.ok) {
      unreadable.current = false;
      baseline.current = result.baseline;
      previousOwnWrites.current = [];
      dirtyRef.current = false; setDirty(false); setWarning('');
      return true;
    }
    if (result.reason === 'blocked') unreadable.current = true;
    if (result.reason === 'write') previousOwnWrites.current.push(next);
    dirtyRef.current = true; setDirty(true); setWarning(result.error);
    return false;
  }
  function chooseStar(id: string) {
    setSelectedId(id); setMessage('');
    if (fromId) setToId(id === fromId ? null : id);
  }
  function beginThread() {
    if (!selected) return;
    setFromId(selected.id); setToId(null); setMessage('Choose another star. The thread waits for your say-so.');
  }
  function cancelThread() { setFromId(null); setToId(null); setMessage('The stars can stay just as they are.'); }
  function connect() {
    const edge = makeThread(fromId || '', toId || '');
    if (busy.current || !edge || !recordsRef.current.some(star => star.id === edge.a) || !recordsRef.current.some(star => star.id === edge.b)) return;
    if (mapRef.current.edges.some(item => item.id === edge.id)) return;
    busy.current = true;
    const next = { ...mapRef.current, edges: [...mapRef.current.edges, edge] };
    update(next);
    const saved = persist(next);
    setMessage(saved ? 'A golden thread, chosen by you. Saved in this browser.' : 'A golden thread, chosen by you. Not saved yet.');
    setFromId(null); setToId(null); setRecentThread(edge.id);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setRecentThread(null), 2200);
    busy.current = false;
  }
  function removeThread(id: string) {
    if (busy.current) return;
    busy.current = true;
    const next = { ...mapRef.current, edges: mapRef.current.edges.filter(edge => edge.id !== id) };
    update(next); const saved = persist(next);
    setMessage(saved ? 'The thread is untied. Both beginnings still have their stars.' : 'The thread is untied for this visit. This change is not saved yet.');
    busy.current = false;
  }
  function changeName(value: string) {
    if (activeNameAnchor) setNameDrafts(drafts => ({ ...drafts, [activeNameAnchor]: value }));
  }
  function saveName() {
    if (!group || !activeNameAnchor || nameError || busy.current) return;
    busy.current = true;
    const next: UniverseMap = { ...mapRef.current, names: [
      ...mapRef.current.names.filter(name => !group.starIds.includes(name.anchorId)),
      ...(nameValue.trim() ? [{ anchorId: selected?.id || group.id, text: nameValue }] : []),
    ] };
    update(next); const saved = persist(next);
    setNameDrafts(drafts => Object.fromEntries(Object.entries(drafts).filter(([anchor]) => !group.starIds.includes(anchor))));
    setMessage(saved ? (nameValue.trim() ? 'Your name, kept with these stars.' : 'This constellation is unnamed. Its threads remain.') : 'Your name is here for now. This change is not saved yet.');
    busy.current = false;
  }
  function useOtherName(anchor: string) {
    if (activeNameAnchor && Object.hasOwn(nameDrafts, anchor)) setNameDrafts(drafts => ({ ...drafts, [activeNameAnchor]: drafts[anchor] }));
  }
  function retry() {
    if (persist(mapRef.current)) setMessage('Your sky is saved in this browser.');
  }
  function recheck() {
    const result = initial.storage.load();
    if (result.blocked) { unreadable.current = true; setWarning(result.error || 'The saved sky could not be read. Its stored data was left untouched.'); return; }
    const clearedUnreadableSky = unreadable.current && result.baseline === null;
    const acknowledgedOwnWrite = previousOwnWrites.current.some(previous => serializeUniverse(previous) === serializeUniverse(result.map));
    if (dirtyRef.current && result.baseline !== baseline.current && !clearedUnreadableSky && !acknowledgedOwnWrite) {
      setWarning('The saved sky is different from this open sky. Both have been kept; this page will not overwrite the saved version. Open names and unsaved threads remain here until this page closes.');
      return;
    }
    baseline.current = result.baseline;
    previousOwnWrites.current = [];
    unreadable.current = false;
    if (!dirtyRef.current) update(result.map);
    setWarning(''); setMessage(dirtyRef.current ? 'The saved sky can be read again. Retry saving when you are ready.' : 'The saved sky can be read again.');
  }
  return { map, stars, groups, selected, selectedSaved: selected ? !!savedExhibits[selected.id] : false, group, fromId, toId, pair, alreadyConnected, warning, dirty, message, recentThread, missingThreads, nameValue, nameError, activeNameAnchor, groupDrafts,
    chooseStar, beginThread, cancelThread, connect, removeThread, changeName, saveName, useOtherName, retry, recheck };
}
export type ObservatorySkyState = ReturnType<typeof useObservatorySky>;

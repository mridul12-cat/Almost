import { emptyUniverse, isUniverseMap, type UniverseMap } from '../model/universe';
import type { StorageLike } from '../model/types';

export const UNIVERSE_KEY = 'almost:observatory:universe';
export interface UniverseLoadResult { map: UniverseMap; baseline: string | null; blocked: boolean; error?: string }
export type UniverseSaveResult = { ok: true; baseline: string } | { ok: false; reason: 'blocked' | 'conflict' | 'write' | 'invalid'; error: string };

const LOAD_WARNING = 'Your saved star map could not be read. Its stored threads and names have been left untouched. New changes stay here for now and may disappear after a reload.';
const SAVE_WARNING = 'Your star map is here for this visit, but this browser could not save its latest changes. They may disappear after a reload. You can retry saving.';
const CONFLICT_WARNING = 'The saved star map changed elsewhere. It has been left untouched. Your changes remain in this visit and may disappear after a reload.';

export function serializeUniverse(map: UniverseMap): string {
  return JSON.stringify({
    schemaVersion: 1,
    edges: map.edges.map(edge => ({ id: edge.id, a: edge.a, b: edge.b })),
    names: map.names.map(name => ({ anchorId: name.anchorId, text: name.text })),
  });
}

function sameUniverse(a: UniverseMap, b: UniverseMap): boolean {
  if (a.edges.length !== b.edges.length || a.names.length !== b.names.length) return false;
  const ids = new Set(a.edges.map(edge => edge.id));
  const names = new Map(a.names.map(name => [name.anchorId, name.text]));
  return b.edges.every(edge => ids.has(edge.id)) && b.names.every(name => names.get(name.anchorId) === name.text);
}

/** This one personal graph has an independent key; reads never repair or reset data. */
export function createUniverseStorage(local: () => StorageLike) {
  let blocked = true;
  function load(): UniverseLoadResult {
    let baseline: string | null = null;
    try {
      baseline = local().getItem(UNIVERSE_KEY);
      if (baseline === null) { blocked = false; return { map: emptyUniverse(), baseline, blocked }; }
      const map: unknown = JSON.parse(baseline);
      if (!isUniverseMap(map)) throw new Error('Unsupported star map');
      blocked = false;
      return { map, baseline, blocked };
    } catch {
      blocked = true;
      return { map: emptyUniverse(), baseline, blocked, error: LOAD_WARNING };
    }
  }

  function save(map: UniverseMap, baseline: string | null, previousOwnWrites: UniverseMap[] = []): UniverseSaveResult {
    if (!isUniverseMap(map)) return { ok: false, reason: 'invalid', error: 'The star map needs valid threads and names before it can be saved. Your changes remain here.' };
    if (blocked) return { ok: false, reason: 'blocked', error: LOAD_WARNING };
    let store: StorageLike;
    let stored: string | null;
    let current: UniverseMap | null = null;
    try {
      store = local();
      stored = store.getItem(UNIVERSE_KEY);
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        if (!isUniverseMap(parsed)) throw new Error('Unsupported star map');
        current = parsed;
        // A previous write may have succeeded while its acknowledgement failed.
        if (sameUniverse(current, map)) return { ok: true, baseline: stored };
      }
    } catch {
      blocked = true;
      return { ok: false, reason: 'blocked', error: LOAD_WARNING };
    }
    // A failed acknowledgement can precede further in-memory edits. Only a verified
    // snapshot of this caller's own attempted writes can stand in for its baseline.
    const verifiedOwnWrite = current !== null && Array.isArray(previousOwnWrites)
      && previousOwnWrites.some(previous => isUniverseMap(previous) && sameUniverse(current!, previous));
    if (stored !== baseline && !verifiedOwnWrite) return { ok: false, reason: 'conflict', error: CONFLICT_WARNING };
    const desired = serializeUniverse(map);
    try {
      store.setItem(UNIVERSE_KEY, desired);
      if (store.getItem(UNIVERSE_KEY) !== desired) throw new Error('Star map read-back failed');
      return { ok: true, baseline: desired };
    } catch { return { ok: false, reason: 'write', error: SAVE_WARNING }; }
  }
  return { load, save };
}

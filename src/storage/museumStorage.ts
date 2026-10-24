import type { Draft, Exhibit, StorageLike } from '../model/types';
import { isDraft, isExhibit } from '../model/validation';
export const EXHIBIT_PREFIX = 'almost:exhibit:';
export const DRAFT_KEY = 'almost:draft';
export interface LoadResult { records: Exhibit[]; baselines: Record<string, string>; blocked: boolean; error?: string }
export type SaveResult = { ok: true; baseline: string } | { ok: false; reason: 'blocked' | 'conflict' | 'write' | 'invalid'; error: string };
export type DraftResult = { ok: true } | { ok: false; error: string };
const LOAD_WARNING = 'Your saved collection could not be loaded fully. Existing data has been left untouched. Temporary exhibits may disappear after a reload.';
export const SAVE_WARNING = "Your exhibit is here for now, but this browser couldn't save it for your next visit.";
export function serializeExhibit(exhibit: Exhibit): string {
  return JSON.stringify({ schemaVersion: 1, id: exhibit.id, title: exhibit.title, description: exhibit.description, artifactType: exhibit.artifactType, lightOn: exhibit.lightOn, createdAt: exhibit.createdAt });
}
/** Providers catch errors from accessing window.localStorage/sessionStorage itself. No operation runs at construction. */
export function createMuseumStorage(local: () => StorageLike, session: () => StorageLike) {
  let blocked = true;
  let draftBlocked = true;
  function scan(): LoadResult {
    const records: Exhibit[] = [];
    const baselines: Record<string, string> = {};
    let invalid = false;
    try {
      const store = local();
      const keys = new Set<string>();
      for (let index = 0; index < store.length; index++) {
        const key = store.key(index);
        if (key?.startsWith(EXHIBIT_PREFIX)) keys.add(key);
      }
      for (const key of keys) {
        try {
          const raw = store.getItem(key);
          if (raw === null) { invalid = true; continue; }
          const parsed: unknown = JSON.parse(raw);
          if (!isExhibit(parsed, key.slice(EXHIBIT_PREFIX.length))) { invalid = true; continue; }
          records.push(parsed);
          baselines[parsed.id] = raw;
        } catch { invalid = true; }
      }
    } catch { invalid = true; }
    records.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
    return { records, baselines, blocked: invalid, ...(invalid ? { error: LOAD_WARNING } : {}) };
  }
  function load(): LoadResult {
    const result = scan();
    blocked = result.blocked;
    return result;
  }
  function save(exhibit: Exhibit, baseline: string | null): SaveResult {
    if (!isExhibit(exhibit)) return { ok: false, reason: 'invalid', error: 'The exhibit needs valid words and a form before it can be saved.' };
    if (blocked) return { ok: false, reason: 'blocked', error: LOAD_WARNING };
    const current = scan();
    if (current.blocked) { blocked = true; return { ok: false, reason: 'blocked', error: LOAD_WARNING }; }
    try {
      const store = local();
      const key = EXHIBIT_PREFIX + exhibit.id;
      const stored = store.getItem(key);
      const desired = serializeExhibit(exhibit);
      // A successful write whose acknowledgement failed can safely be retried.
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        if (!isExhibit(parsed, exhibit.id)) { blocked = true; return { ok: false, reason: 'blocked', error: LOAD_WARNING }; }
        if (serializeExhibit(parsed) === desired) return { ok: true, baseline: stored };
      }
      if (stored !== baseline) return { ok: false, reason: 'conflict', error: 'This exhibit changed in another tab. Both versions have been kept; this page will not overwrite the saved one.' };
      store.setItem(key, desired);
      if (store.getItem(key) !== desired) return { ok: false, reason: 'write', error: SAVE_WARNING };
      return { ok: true, baseline: desired };
    } catch { return { ok: false, reason: 'write', error: SAVE_WARNING }; }
  }
  function readDraft(): { draft: Draft | null; error?: string } {
    try {
      const raw = session().getItem(DRAFT_KEY);
      if (raw === null) { draftBlocked = false; return { draft: null }; }
      const parsed: unknown = JSON.parse(raw);
      if (!isDraft(parsed)) throw new Error('Unsupported draft');
      draftBlocked = false;
      return { draft: parsed };
    } catch { draftBlocked = true; return { draft: null, error: 'An earlier draft could not be read. It has been left untouched. New words may remain only while this page stays open.' }; }
  }
  function writeDraft(draft: Draft): DraftResult {
    if (draftBlocked) return { ok: false, error: 'The previous draft could not be read. Its stored words have been left untouched; new words remain only while this page stays open.' };
    if (!isDraft(draft)) return { ok: false, error: 'The draft could not be saved; your words remain in this page.' };
    try {
      const store = session();
      const existing = store.getItem(DRAFT_KEY);
      if (existing !== null) {
        try { if (!isDraft(JSON.parse(existing))) throw new Error('Unsupported draft'); }
        catch { draftBlocked = true; throw new Error('Unreadable existing draft'); }
      }
      const raw = JSON.stringify(draft);
      store.setItem(DRAFT_KEY, raw);
      if (store.getItem(DRAFT_KEY) !== raw) throw new Error('Draft read-back failed');
      return { ok: true };
    } catch { return { ok: false, error: 'Your draft remains here while this page is open, but could not be saved for a reload.' }; }
  }
  function clearDraft(): DraftResult {
    if (draftBlocked) return { ok: false, error: 'The stored draft could not be read and has been left untouched.' };
    try {
      const store = session();
      const raw = store.getItem(DRAFT_KEY);
      if (raw !== null) {
        try { if (!isDraft(JSON.parse(raw))) throw new Error('Unsupported draft'); }
        catch { draftBlocked = true; throw new Error('Unreadable existing draft'); }
      }
      store.removeItem(DRAFT_KEY);
      if (store.getItem(DRAFT_KEY) !== null) throw new Error('Draft removal failed');
      return { ok: true };
    }
    catch { return { ok: false, error: 'Your exhibit is saved, but its completed draft could not be cleared. It will be checked when you return.' }; }
  }
  return { load, save, readDraft, writeDraft, clearDraft };
}

import { isJournalDraft, isJournalEntry, type JournalDraft, type JournalEntry } from '../model/journal';
import type { StorageLike } from '../model/types';

export const JOURNAL_PREFIX = 'almost:journal:entry:';
export const JOURNAL_DRAFT_KEY = 'almost:journal:draft';
export interface JournalLoadResult { entries: JournalEntry[]; baselines: Record<string, string>; blocked: boolean; error?: string }
export type JournalSaveResult = { ok: true; baseline: string } | { ok: false; reason: 'blocked' | 'conflict' | 'write' | 'invalid'; error: string };
export type JournalDraftResult = { ok: true } | { ok: false; error: string };
const LOAD_WARNING = 'Your saved journal could not be read fully. Its stored pages have been left untouched. New words stay here for now and may disappear after a reload.';
const SAVE_WARNING = 'This memory is here for now, but this browser could not save it for your next visit. Your words are still on the open page.';
const DRAFT_WARNING = 'Your open page remains here, but could not be saved for a reload.';
const DRAFT_BLOCKED = 'An earlier journal page could not be read. Its stored words have been left untouched; new words may remain only while this page stays open.';
export function serializeJournalEntry(entry: JournalEntry): string {
  return JSON.stringify({ schemaVersion: 1, id: entry.id, title: entry.title, body: entry.body, createdAt: entry.createdAt, updatedAt: entry.updatedAt, timeZone: entry.timeZone });
}

/** Independent journal namespace; construction and reads never modify browser storage. */
export function createJournalStorage(local: () => StorageLike, session: () => StorageLike) {
  let blocked = true;
  let draftBlocked = true;
  function scan(): JournalLoadResult {
    const entries: JournalEntry[] = [];
    const baselines: Record<string, string> = {};
    let invalid = false;
    try {
      const store = local();
      const keys = new Set<string>();
      for (let index = 0; index < store.length; index++) {
        const key = store.key(index);
        if (key?.startsWith(JOURNAL_PREFIX)) keys.add(key);
      }
      for (const key of keys) {
        try {
          const raw = store.getItem(key);
          if (raw === null) { invalid = true; continue; }
          const entry: unknown = JSON.parse(raw);
          if (!isJournalEntry(entry, key.slice(JOURNAL_PREFIX.length))) { invalid = true; continue; }
          entries.push(entry);
          baselines[entry.id] = raw;
        } catch { invalid = true; }
      }
    } catch { invalid = true; }
    entries.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || a.id.localeCompare(b.id));
    return { entries, baselines, blocked: invalid, ...(invalid ? { error: LOAD_WARNING } : {}) };
  }
  function load(): JournalLoadResult {
    const result = scan();
    blocked = result.blocked;
    return result;
  }
  function save(entry: JournalEntry, baseline: string | null): JournalSaveResult {
    if (!isJournalEntry(entry)) return { ok: false, reason: 'invalid', error: 'The memory needs valid words and a recording time before it can be saved.' };
    if (blocked) return { ok: false, reason: 'blocked', error: LOAD_WARNING };
    if (scan().blocked) { blocked = true; return { ok: false, reason: 'blocked', error: LOAD_WARNING }; }
    try {
      const store = local();
      const key = JOURNAL_PREFIX + entry.id;
      const stored = store.getItem(key);
      const desired = serializeJournalEntry(entry);
      let original: JournalEntry | null = null;
      if (stored !== null) {
        let current: unknown;
        try { current = JSON.parse(stored); }
        catch { blocked = true; return { ok: false, reason: 'blocked', error: LOAD_WARNING }; }
        if (!isJournalEntry(current, entry.id)) { blocked = true; return { ok: false, reason: 'blocked', error: LOAD_WARNING }; }
        original = current;
        // A prior write may have succeeded even though its acknowledgement failed.
        if (serializeJournalEntry(current) === desired) return { ok: true, baseline: stored };
      }
      if (stored !== baseline) return { ok: false, reason: 'conflict', error: 'This memory changed elsewhere. The saved page has been left untouched, and your words remain on the open page.' };
      if (original && (entry.createdAt !== original.createdAt || entry.timeZone !== original.timeZone)) return { ok: false, reason: 'invalid', error: 'The original recording time and time zone must stay with this memory. Your words remain on the open page.' };
      store.setItem(key, desired);
      if (store.getItem(key) !== desired) return { ok: false, reason: 'write', error: SAVE_WARNING };
      return { ok: true, baseline: desired };
    } catch { return { ok: false, reason: 'write', error: SAVE_WARNING }; }
  }
  function readDraft(): { draft: JournalDraft | null; error?: string } {
    try {
      const raw = session().getItem(JOURNAL_DRAFT_KEY);
      if (raw === null) { draftBlocked = false; return { draft: null }; }
      const draft: unknown = JSON.parse(raw);
      if (!isJournalDraft(draft)) throw new Error('Unsupported journal page');
      draftBlocked = false;
      return { draft };
    } catch { draftBlocked = true; return { draft: null, error: DRAFT_BLOCKED }; }
  }
  function existingDraft(store: StorageLike): JournalDraft | null {
    const raw = store.getItem(JOURNAL_DRAFT_KEY);
    if (raw === null) return null;
    try {
      const draft: unknown = JSON.parse(raw);
      if (!isJournalDraft(draft)) throw new Error('Unsupported journal page');
      return draft;
    } catch { draftBlocked = true; throw new Error('Unreadable journal page'); }
  }
  function writeDraft(draft: JournalDraft): JournalDraftResult {
    if (draftBlocked) return { ok: false, error: DRAFT_BLOCKED };
    if (!isJournalDraft(draft)) return { ok: false, error: DRAFT_WARNING };
    try {
      const store = session();
      const previous = existingDraft(store);
      if (previous && previous.id !== draft.id) return { ok: false, error: 'Another journal page is still open. Its stored words have been left untouched; your current words remain here.' };
      const raw = JSON.stringify(draft);
      store.setItem(JOURNAL_DRAFT_KEY, raw);
      if (store.getItem(JOURNAL_DRAFT_KEY) !== raw) throw new Error('Journal page read-back failed');
      return { ok: true };
    } catch { return { ok: false, error: draftBlocked ? DRAFT_BLOCKED : DRAFT_WARNING }; }
  }
  function clearDraft(expectedId: string): JournalDraftResult {
    if (draftBlocked) return { ok: false, error: DRAFT_BLOCKED };
    try {
      const store = session();
      const previous = existingDraft(store);
      if (previous && previous.id !== expectedId) return { ok: false, error: 'A different journal page is open. Its stored words have been left untouched.' };
      if (previous) store.removeItem(JOURNAL_DRAFT_KEY);
      if (store.getItem(JOURNAL_DRAFT_KEY) !== null) throw new Error('Journal page cleanup failed');
      return { ok: true };
    } catch { return { ok: false, error: draftBlocked ? DRAFT_BLOCKED : 'The memory is saved, but its open-page copy could not be cleared. It will be checked when you return.' }; }
  }
  return { load, save, readDraft, writeDraft, clearDraft };
}

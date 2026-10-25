import { describe, expect, it } from 'vitest';
import { createJournalDraft, isJournalDraft, isJournalEntry, validateJournalDraft, type JournalEntry } from '../src/model/journal';
import { createJournalStorage, JOURNAL_DRAFT_KEY, JOURNAL_PREFIX, serializeJournalEntry } from '../src/storage/journalStorage';
import type { StorageLike } from '../src/model/types';

const ID = '00000000-0000-4000-8000-000000000001';
const OTHER_ID = '00000000-0000-4000-8000-000000000002';
const entry = (id = ID): JournalEntry => ({ schemaVersion: 1, id, title: '  A little memory 🌿  ', body: 'A beginning remembered.\n<script>Literal words</script> ✨  ', createdAt: '2026-10-26T00:00:00.000Z', updatedAt: '2026-10-26T00:00:00.000Z', timeZone: 'Asia/Kolkata' });
class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  writes = 0;
  deletes = 0;
  failWrite = false;
  failRead = false;
  failRemove = false;
  failEnumeration = false;
  failReadback = false;
  private failOneRead = false;
  get length() { if (this.failEnumeration) throw new Error('denied'); return this.data.size; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  getItem(key: string) {
    if (this.failOneRead) { this.failOneRead = false; throw new Error('acknowledgement failed'); }
    if (this.failRead) throw new Error('denied');
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.writes++;
    if (this.failWrite) throw new Error('quota');
    this.data.set(key, value);
    if (this.failReadback) this.failOneRead = true;
  }
  removeItem(key: string) {
    this.deletes++;
    if (this.failRemove) throw new Error('denied');
    this.data.delete(key);
  }
}
function setup() {
  const local = new MemoryStorage();
  const session = new MemoryStorage();
  const storage = createJournalStorage(() => local, () => session);
  storage.load(); storage.readDraft();
  return { local, session, storage };
}

describe('journal model and recording times', () => {
  it('accepts optional titles and preserves exact Unicode, whitespace and line breaks', () => {
    expect(isJournalEntry(entry())).toBe(true);
    expect(isJournalEntry({ ...entry(), title: '' })).toBe(true);
    expect(isJournalEntry({ ...entry(), title: ' 🌿 '.repeat(34) })).toBe(false);
    const exact = { ...entry(), title: '🌿'.repeat(100), body: '✨'.repeat(5000) };
    expect(isJournalEntry(exact)).toBe(true);
    expect(isJournalEntry({ ...exact, body: exact.body + '🌿' })).toBe(false);
    expect(JSON.parse(serializeJournalEntry(entry()))).toEqual(entry());
  });
  it('validates final words without truncating unfinished or over-limit drafts', () => {
    const draft = { ...createJournalDraft(ID, 'UTC'), title: '🌿'.repeat(101), body: '🌿'.repeat(5001) };
    expect(isJournalDraft(draft)).toBe(true);
    expect(validateJournalDraft(draft)).toHaveProperty('title');
    expect(validateJournalDraft(draft)).toHaveProperty('body');
    expect(validateJournalDraft({ title: '', body: ' \n\t' })).toHaveProperty('body');
    expect(validateJournalDraft({ title: '', body: ' Just a memory.\n' })).toEqual({});
    expect(draft.body).toHaveLength(10002);
  });
  it.each([
    { createdAt: '2026-02-31T00:00:00.000Z' },
    { updatedAt: '2026-10-25T00:00:00.000Z' },
    { createdAt: '2026-10-26' },
    { updatedAt: 'tomorrow' },
    { timeZone: 'Somewhere/Imaginary' },
    { timeZone: '+05:30' },
    { schemaVersion: 2 },
    { extra: 'unrecognized future field' },
    { id: '../not-an-id' },
  ])('rejects unsupported/invalid saved metadata without accepting a replacement: %j', changes => {
    expect(isJournalEntry({ ...entry(), ...changes })).toBe(false);
  });
  it('requires paired pending timestamps and matching expected record ID', () => {
    expect(isJournalEntry(entry(), OTHER_ID)).toBe(false);
    expect(isJournalDraft({ ...createJournalDraft(ID, 'UTC'), modifiedAt: entry().updatedAt })).toBe(false);
    expect(isJournalDraft({ ...createJournalDraft(ID, 'UTC'), createdAt: entry().createdAt, modifiedAt: '2026-10-25T00:00:00.000Z' })).toBe(false);
    expect(isJournalDraft({ ...createJournalDraft(ID, 'UTC'), baseline: 1 })).toBe(false);
    expect(isJournalDraft({ ...createJournalDraft(ID, 'UTC'), createdAt: entry().createdAt, modifiedAt: entry().updatedAt, baseline: serializeJournalEntry(entry()) })).toBe(true);
  });
});

describe('independent journal storage', () => {
  it('writes one ID once, accepts duplicate acknowledgement, edits by baseline, and preserves other namespaces', () => {
    const { storage, local, session } = setup();
    const other = JSON.stringify(entry(OTHER_ID), null, 3);
    const exhibit = '{ "schemaVersion": 1, "privateWords": "untouched" }';
    const exhibitDraft = ' an unrelated draft, even unreadable ';
    local.data.set(JOURNAL_PREFIX + OTHER_ID, other);
    local.data.set('almost:exhibit:unrelated', exhibit);
    session.data.set('almost:draft', exhibitDraft);
    const first = storage.save(entry(), null);
    expect(first.ok).toBe(true);
    expect(storage.save(entry(), null).ok).toBe(true);
    expect(local.writes).toBe(1);
    if (!first.ok) throw new Error('Expected initial save');
    const edited = { ...entry(), body: '  My exact changed words.\n🌿 ', updatedAt: '2026-10-26T01:15:00.000Z' };
    expect(storage.save(edited, first.baseline).ok).toBe(true);
    expect(storage.load().entries.find(value => value.id === ID)).toEqual(edited);
    expect(local.data.get(JOURNAL_PREFIX + OTHER_ID)).toBe(other);
    expect(local.data.get('almost:exhibit:unrelated')).toBe(exhibit);
    expect(session.data.get('almost:draft')).toBe(exhibitDraft);
    expect(local.data.size).toBe(3);
    expect(local.deletes).toBe(0);
  });
  it('loads newest recordings first, deterministically resolves ties, and performs no writes', () => {
    const { storage, local } = setup();
    local.data.set(JOURNAL_PREFIX + OTHER_ID, JSON.stringify({ ...entry(OTHER_ID), createdAt: '2026-10-26T02:00:00.000Z', updatedAt: '2026-10-26T02:00:00.000Z' }, null, 2));
    const raw = JSON.stringify(entry(), null, 3);
    local.data.set(JOURNAL_PREFIX + ID, raw);
    const result = storage.load();
    expect(result.entries.map(value => value.id)).toEqual([OTHER_ID, ID]);
    expect(result.baselines[ID]).toBe(raw);
    local.data.set(JOURNAL_PREFIX + OTHER_ID, serializeJournalEntry(entry(OTHER_ID)));
    expect(storage.load().entries.map(value => value.id)).toEqual([ID, OTHER_ID]);
    expect(local.writes).toBe(0);
  });
  it('preserves intended content through failed writes and retries the same ID', () => {
    const { storage, local } = setup();
    const desired = entry(); local.failWrite = true;
    expect(storage.save(desired, null)).toMatchObject({ ok: false, reason: 'write' });
    expect(local.data.size).toBe(0);
    expect(desired).toEqual(entry());
    local.failWrite = false;
    expect(storage.save(desired, null).ok).toBe(true);
    expect(storage.load().entries).toEqual([desired]);
  });
  it('does not celebrate a failed read-back and accepts a retry without a second write', () => {
    const { storage, local } = setup(); local.failReadback = true;
    expect(storage.save(entry(), null)).toMatchObject({ ok: false, reason: 'write' });
    local.failReadback = false;
    expect(storage.save(entry(), null).ok).toBe(true);
    expect(local.writes).toBe(1);
    expect(storage.load().entries).toEqual([entry()]);
  });
  it.each([
    { createdAt: '2026-10-25T00:00:00.000Z' },
    { timeZone: 'UTC' },
  ])('protects original recording metadata when an edited page is saved: %j', changes => {
    const { storage, local } = setup();
    const baseline = serializeJournalEntry(entry()); local.data.set(JOURNAL_PREFIX + ID, baseline);
    expect(storage.save({ ...entry(), ...changes }, baseline)).toMatchObject({ ok: false, reason: 'invalid' });
    expect(local.data.get(JOURNAL_PREFIX + ID)).toBe(baseline);
    expect(local.writes).toBe(0);
  });
  it('keeps an existing page intact after a failed edit, then retries with its original baseline', () => {
    const { storage, local } = setup();
    const baseline = serializeJournalEntry(entry()); local.data.set(JOURNAL_PREFIX + ID, baseline);
    const changed = { ...entry(), title: 'An edited name', updatedAt: '2026-10-26T03:00:00.000Z' };
    local.failWrite = true;
    expect(storage.save(changed, baseline).ok).toBe(false);
    expect(local.data.get(JOURNAL_PREFIX + ID)).toBe(baseline);
    local.failWrite = false;
    expect(storage.save(changed, baseline).ok).toBe(true);
    expect(storage.load().entries[0]).toEqual(changed);
  });
  it('rejects stale edits without overwriting newer stored words', () => {
    const { storage, local } = setup();
    const baseline = serializeJournalEntry(entry());
    const newer = { ...entry(), body: 'A page changed elsewhere.', updatedAt: '2026-10-26T04:00:00.000Z' };
    const raw = JSON.stringify(newer, null, 2); local.data.set(JOURNAL_PREFIX + ID, raw);
    expect(storage.save({ ...entry(), title: 'My unfinished edit' }, baseline)).toMatchObject({ ok: false, reason: 'conflict' });
    expect(local.data.get(JOURNAL_PREFIX + ID)).toBe(raw);
    expect(local.writes).toBe(0);
    expect(storage.save(newer, baseline)).toEqual({ ok: true, baseline: raw });
  });
  it.each([
    '{broken',
    JSON.stringify({ ...entry(), schemaVersion: 2 }),
    JSON.stringify({ ...entry(), id: OTHER_ID }),
    JSON.stringify({ ...entry(), timeZone: 'not/a-zone' }),
    JSON.stringify({ ...entry(), body: '  ' }),
  ])('preserves corrupt/future records and requires explicit recheck before writing: %s', raw => {
    const { storage, local } = setup(); local.data.set(JOURNAL_PREFIX + ID, raw);
    expect(storage.load().blocked).toBe(true);
    expect(storage.save(entry(OTHER_ID), null)).toMatchObject({ ok: false, reason: 'blocked' });
    expect(local.data.get(JOURNAL_PREFIX + ID)).toBe(raw);
    expect(local.writes).toBe(0); expect(local.deletes).toBe(0);
    local.data.set(JOURNAL_PREFIX + ID, serializeJournalEntry(entry()));
    expect(storage.save(entry(OTHER_ID), null).ok).toBe(false);
    expect(storage.load().blocked).toBe(false);
    expect(storage.save(entry(OTHER_ID), null).ok).toBe(true);
  });
  it('keeps readable pages visible beside corruption, and catches newly introduced corruption before saving', () => {
    const { storage, local } = setup();
    local.data.set(JOURNAL_PREFIX + ID, serializeJournalEntry(entry()));
    local.data.set(JOURNAL_PREFIX + OTHER_ID, 'unreadable');
    expect(storage.load()).toMatchObject({ blocked: true, entries: [entry()] });
    const clean = setup(); clean.local.data.set(JOURNAL_PREFIX + OTHER_ID, 'unreadable');
    expect(clean.storage.save(entry(), null)).toMatchObject({ ok: false, reason: 'blocked' });
    expect(clean.local.writes).toBe(0);
  });
  it('handles denied providers, reads, and enumeration without replacing stored content', () => {
    const denied = createJournalStorage(() => { throw new Error('denied'); }, () => { throw new Error('denied'); });
    expect(denied.load().blocked).toBe(true);
    expect(denied.readDraft()).toMatchObject({ draft: null });
    expect(denied.readDraft().error).toBeTruthy();
    expect(denied.save(entry(), null).ok).toBe(false);
    const { storage, local } = setup(); local.data.set(JOURNAL_PREFIX + ID, serializeJournalEntry(entry()));
    local.failRead = true;
    expect(storage.load().blocked).toBe(true);
    local.failRead = false;
    expect(storage.save(entry(OTHER_ID), null).ok).toBe(false);
    expect(storage.load().entries).toEqual([entry()]);
    local.failEnumeration = true;
    expect(storage.load().blocked).toBe(true);
    expect(local.writes).toBe(0);
  });
});

describe('journal open-page protection', () => {
  it('roundtrips incomplete and over-limit draft words without touching the exhibit draft', () => {
    const { storage, session } = setup();
    session.data.set('almost:draft', 'an independent exhibit draft');
    const draft = { ...createJournalDraft(ID, 'Asia/Kolkata'), title: '✨'.repeat(101), body: '  🌿\n'.repeat(1500) };
    expect(storage.writeDraft(draft).ok).toBe(true);
    expect(storage.readDraft().draft).toEqual(draft);
    expect(session.data.get('almost:draft')).toBe('an independent exhibit draft');
  });
  it('preserves stale-edit baselines and original recording metadata in the draft', () => {
    const { storage } = setup();
    const draft = { ...createJournalDraft(ID, 'Asia/Kolkata'), title: 'My uncommitted edit', body: 'Words still changing.', createdAt: entry().createdAt, baseline: JSON.stringify(entry(), null, 2) };
    expect(storage.writeDraft(draft).ok).toBe(true);
    expect(storage.readDraft().draft).toEqual(draft);
  });
  it.each(['broken', JSON.stringify({ ...createJournalDraft(ID, 'UTC'), schemaVersion: 2 })])('never replaces or removes unreadable open pages: %s', raw => {
    const { storage, session } = setup(); session.data.set(JOURNAL_DRAFT_KEY, raw);
    expect(storage.readDraft().error).toBeTruthy();
    expect(storage.writeDraft(createJournalDraft(ID, 'UTC')).ok).toBe(false);
    expect(storage.clearDraft(ID).ok).toBe(false);
    expect(session.data.get(JOURNAL_DRAFT_KEY)).toBe(raw);
    session.data.set(JOURNAL_DRAFT_KEY, JSON.stringify(createJournalDraft(ID, 'UTC')));
    expect(storage.writeDraft(createJournalDraft(ID, 'UTC')).ok).toBe(false);
    expect(storage.readDraft().draft).toEqual(createJournalDraft(ID, 'UTC'));
    expect(storage.writeDraft(createJournalDraft(ID, 'UTC')).ok).toBe(true);
  });
  it('refuses replacement and cleanup of another ID, then clears only the matching page', () => {
    const { storage, session } = setup();
    const raw = JSON.stringify(createJournalDraft(ID, 'UTC'), null, 2); session.data.set(JOURNAL_DRAFT_KEY, raw);
    expect(storage.writeDraft(createJournalDraft(OTHER_ID, 'UTC')).ok).toBe(false);
    expect(storage.clearDraft(OTHER_ID).ok).toBe(false);
    expect(session.data.get(JOURNAL_DRAFT_KEY)).toBe(raw);
    expect(session.writes).toBe(0); expect(session.deletes).toBe(0);
    expect(storage.clearDraft(ID).ok).toBe(true);
    expect(session.data.has(JOURNAL_DRAFT_KEY)).toBe(false);
    expect(storage.clearDraft(ID).ok).toBe(true);
    expect(session.deletes).toBe(1);
  });
  it('detects corruption added after a valid read and leaves it untouched', () => {
    const { storage, session } = setup(); session.data.set(JOURNAL_DRAFT_KEY, 'changed to unsupported content');
    expect(storage.writeDraft(createJournalDraft(ID, 'UTC')).ok).toBe(false);
    expect(storage.clearDraft(ID).ok).toBe(false);
    expect(session.data.get(JOURNAL_DRAFT_KEY)).toBe('changed to unsupported content');
    expect(session.writes).toBe(0); expect(session.deletes).toBe(0);
  });
  it('reports failed session writes and readback honestly while retaining retryable words', () => {
    const { storage, session } = setup(); const draft = { ...createJournalDraft(ID, 'UTC'), body: ' Still in memory.\n' };
    session.failWrite = true;
    expect(storage.writeDraft(draft).ok).toBe(false);
    session.failWrite = false; session.failReadback = true;
    expect(storage.writeDraft(draft).ok).toBe(false);
    session.failReadback = false;
    expect(storage.readDraft().draft).toEqual(draft);
    expect(storage.writeDraft(draft).ok).toBe(true);
  });
  it('retains the completed draft when cleanup fails, so the UI can reconcile it on return', () => {
    const { storage, session } = setup(); const draft = { ...createJournalDraft(ID, 'UTC'), body: entry().body, title: entry().title, createdAt: entry().createdAt, modifiedAt: entry().updatedAt };
    storage.writeDraft(draft); session.failRemove = true;
    expect(storage.clearDraft(ID).ok).toBe(false);
    expect(storage.readDraft().draft).toEqual(draft);
    session.failRemove = false;
    expect(storage.clearDraft(ID).ok).toBe(true);
  });
});

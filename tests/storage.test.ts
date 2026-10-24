import { describe, it, expect } from 'vitest';
import { createMuseumStorage, DRAFT_KEY, EXHIBIT_PREFIX, serializeExhibit } from '../src/storage/museumStorage';
import { createDraft, type Exhibit, type StorageLike } from '../src/model/types';
const id = '00000000-0000-4000-8000-000000000001';
const secondId = '00000000-0000-4000-8000-000000000002';
const exhibit = (recordId = id): Exhibit => ({ schemaVersion: 1, id: recordId, title: '  A beginning ✨ ', description: 'A paper garden\n<script>Literal words</script> 🌿', artifactType: 'plant', lightOn: false, createdAt: '2026-10-24T00:00:00.000Z' });
class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  writes = 0;
  deletes = 0;
  failWrite = false;
  failRead = false;
  failReadAfterWrite = false;
  get length() { return this.data.size; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  getItem(key: string) { if (this.failRead) throw new Error('denied'); return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.writes++; if (this.failWrite) throw new Error('quota'); this.data.set(key, value); if (this.failReadAfterWrite) this.failRead = true; }
  removeItem(key: string) { this.deletes++; this.data.delete(key); }
}
function setup() {
  const local = new MemoryStorage();
  const session = new MemoryStorage();
  const storage = createMuseumStorage(() => local, () => session);
  storage.load(); storage.readDraft();
  return { local, session, storage };
}
describe('safe exhibit storage', () => {
  it('upserts by stable ID, keeps exact words, and never changes unrelated bytes', () => {
    const { local, storage } = setup();
    const untouched = JSON.stringify(exhibit(secondId), null, 2);
    local.data.set(EXHIBIT_PREFIX + secondId, untouched);
    const first = storage.save(exhibit(), null);
    expect(first.ok).toBe(true);
    expect(storage.save(exhibit(), null).ok).toBe(true);
    expect(local.writes).toBe(1);
    expect(local.data.size).toBe(2);
    expect(local.data.get(EXHIBIT_PREFIX + secondId)).toBe(untouched);
    expect(storage.load().records.find(record => record.id === id)).toEqual(exhibit());
  });
  it('retains desired record and baseline on failure, then retries same ID', () => {
    const { local, storage } = setup();
    const desired = exhibit();
    local.failWrite = true;
    expect(storage.save(desired, null)).toMatchObject({ ok: false, reason: 'write' });
    expect(desired).toEqual(exhibit());
    local.failWrite = false;
    expect(storage.save(desired, null).ok).toBe(true);
    expect(storage.load().records).toEqual([desired]);
  });
  it('never reports a failed readback as saved and safely accepts a retry acknowledgement', () => {
    const { local, storage } = setup();
    local.failReadAfterWrite = true;
    expect(storage.save(exhibit(), null)).toMatchObject({ ok: false, reason: 'write' });
    local.failRead = false; local.failReadAfterWrite = false;
    expect(storage.save(exhibit(), null).ok).toBe(true);
    expect(local.writes).toBe(1);
  });
  it.each([
    '{bad json',
    JSON.stringify({ ...exhibit(), schemaVersion: 2 }),
    JSON.stringify({ ...exhibit(), id: secondId }),
    JSON.stringify({ ...exhibit(), title: ' ' }),
    JSON.stringify({ ...exhibit(), createdAt: 'tomorrow' }),
    JSON.stringify({ ...exhibit(), extra: 'future data' }),
  ])('blocks all writes for unreadable records and leaves bytes intact: %s', raw => {
    const { local, storage } = setup();
    local.data.set(EXHIBIT_PREFIX + id, raw);
    expect(storage.load().blocked).toBe(true);
    expect(storage.save(exhibit(secondId), null)).toMatchObject({ ok: false, reason: 'blocked' });
    expect(local.writes).toBe(0); expect(local.deletes).toBe(0);
    expect(local.data.get(EXHIBIT_PREFIX + id)).toBe(raw);
    local.data.set(EXHIBIT_PREFIX + id, serializeExhibit(exhibit()));
    expect(storage.save(exhibit(secondId), null).ok).toBe(false);
    expect(storage.load().blocked).toBe(false);
    expect(storage.save(exhibit(secondId), null).ok).toBe(true);
  });
  it('keeps valid records visible beside corruption and writes nothing during load', () => {
    const { local, storage } = setup();
    local.data.set(EXHIBIT_PREFIX + id, serializeExhibit(exhibit()));
    local.data.set(EXHIBIT_PREFIX + secondId, 'broken');
    expect(storage.load()).toMatchObject({ blocked: true, records: [exhibit()] });
    expect(local.writes).toBe(0);
  });
  it('detects corruption introduced after startup before attempting a write', () => {
    const { local, storage } = setup();
    local.data.set(EXHIBIT_PREFIX + secondId, 'broken');
    expect(storage.save(exhibit(), null)).toMatchObject({ ok: false, reason: 'blocked' });
    expect(local.writes).toBe(0);
  });
  it('preserves a previously saved light baseline when a write fails', () => {
    const { local, storage } = setup();
    const initial = storage.save(exhibit(), null);
    if (!initial.ok) throw new Error('Initial save failed');
    const desired = { ...exhibit(), lightOn: true };
    local.failWrite = true;
    expect(storage.save(desired, initial.baseline).ok).toBe(false);
    expect(local.data.get(EXHIBIT_PREFIX + id)).toBe(initial.baseline);
    local.failWrite = false;
    expect(storage.save(desired, initial.baseline).ok).toBe(true);
    expect(storage.load().records[0].lightOn).toBe(true);
  });
  it('detects ordinary stale writes without overwriting another tab', () => {
    const { local, storage } = setup();
    const baseline = serializeExhibit(exhibit());
    const otherTab = { ...exhibit(), title: 'Changed in another tab' };
    local.data.set(EXHIBIT_PREFIX + id, serializeExhibit(otherTab));
    expect(storage.save({ ...exhibit(), lightOn: true }, baseline)).toMatchObject({ ok: false, reason: 'conflict' });
    expect(local.data.get(EXHIBIT_PREFIX + id)).toBe(serializeExhibit(otherTab));
    expect(local.writes).toBe(0);
  });
  it('catches denied property access and enumeration failure', () => {
    const denied = createMuseumStorage(() => { throw new Error('denied'); }, () => new MemoryStorage());
    expect(denied.load().blocked).toBe(true);
    const broken = new MemoryStorage();
    Object.defineProperty(broken, 'length', { get() { throw new Error('denied'); } });
    expect(createMuseumStorage(() => broken, () => broken).load().blocked).toBe(true);
  });
});
describe('session drafts', () => {
  it('roundtrips incomplete, over-limit words and does no writes on read', () => {
    const { storage, session } = setup();
    const draft = { ...createDraft(id), description: ' 🌿\n'.repeat(600) };
    expect(storage.writeDraft(draft).ok).toBe(true);
    expect(storage.readDraft().draft).toEqual(draft);
    expect(session.writes).toBe(1);
  });
  it('retains unreadable session bytes and blocks changes until valid reread', () => {
    const { storage, session } = setup();
    session.data.set(DRAFT_KEY, 'broken');
    expect(storage.readDraft().error).toBeTruthy();
    expect(storage.writeDraft(createDraft(id)).ok).toBe(false);
    expect(storage.clearDraft().ok).toBe(false);
    expect(session.data.get(DRAFT_KEY)).toBe('broken');
    session.data.set(DRAFT_KEY, JSON.stringify(createDraft(id)));
    expect(storage.writeDraft(createDraft(id)).ok).toBe(false);
    expect(storage.readDraft().draft).toEqual(createDraft(id));
    expect(storage.writeDraft(createDraft(id)).ok).toBe(true);
  });
  it('returns an honest memory-only warning on session failure', () => {
    const { storage, session } = setup(); session.failWrite = true;
    expect(storage.writeDraft(createDraft(id))).toMatchObject({ ok: false });
  });
});

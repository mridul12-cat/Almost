import { describe, expect, it } from 'vitest';
import { CONSTELLATION_NAME_LIMIT, emptyUniverse, isUniverseMap, makeThread, universeGroups, type UniverseMap } from '../src/model/universe';
import { createUniverseStorage, serializeUniverse, UNIVERSE_KEY } from '../src/storage/universeStorage';
import type { StorageLike } from '../src/model/types';

const A = '00000000-0000-4000-8000-000000000001';
const B = '00000000-0000-4000-8000-000000000002';
const C = '00000000-0000-4000-8000-000000000003';
const D = '00000000-0000-4000-8000-000000000004';
const E = '00000000-0000-4000-8000-000000000005';
const map = (): UniverseMap => ({ schemaVersion: 1, edges: [makeThread(A, B)!], names: [{ anchorId: A, text: '  Little universes 🌿\n<script>My exact words</script>  ' }] });

class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  writes = 0;
  deletes = 0;
  failRead = false;
  failWrite = false;
  failAcknowledgement = false;
  mismatchAcknowledgement = false;
  private pendingRead = false;
  get length() { return this.data.size; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  getItem(key: string) {
    if (this.failRead) throw new Error('denied');
    if (this.pendingRead) {
      this.pendingRead = false;
      if (this.failAcknowledgement) throw new Error('read-back denied');
      if (this.mismatchAcknowledgement) return null;
    }
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.writes++;
    if (this.failWrite) throw new Error('quota');
    this.data.set(key, value);
    this.pendingRead = this.failAcknowledgement || this.mismatchAcknowledgement;
  }
  removeItem(key: string) { this.deletes++; this.data.delete(key); }
}

function setup(initial?: UniverseMap) {
  const local = new MemoryStorage();
  if (initial) local.data.set(UNIVERSE_KEY, JSON.stringify(initial, null, 2));
  const storage = createUniverseStorage(() => local);
  const loaded = storage.load();
  return { local, storage, loaded };
}

describe('a visitor’s star map', () => {
  it('makes one canonical stable thread for an unordered pair and rejects a self-link or invalid ID', () => {
    expect(makeThread(A, B)).toEqual({ id: `${A}:${B}`, a: A, b: B });
    expect(makeThread(B, A)).toEqual(makeThread(A, B));
    expect(makeThread(A, A)).toBeNull();
    expect(makeThread('not-an-exhibit', B)).toBeNull();
    expect(makeThread(A, '')).toBeNull();
  });
  it('returns independent empty maps without sharing mutable arrays', () => {
    const first = emptyUniverse();
    first.edges.push(makeThread(A, B)!);
    expect(emptyUniverse()).toEqual({ schemaVersion: 1, edges: [], names: [] });
  });
  it('accepts raw Unicode names and dormant anchors without interpreting or trimming them', () => {
    const source = map();
    source.names.push({ anchorId: E, text: '🪐'.repeat(CONSTELLATION_NAME_LIMIT) });
    expect(isUniverseMap(source)).toBe(true);
    expect(JSON.parse(serializeUniverse(source))).toEqual(source);
    expect(source.names[0].text).toBe('  Little universes 🌿\n<script>My exact words</script>  ');
  });
  it.each([
    ['null', null],
    ['future version', { ...map(), schemaVersion: 2 }],
    ['extra map field', { ...map(), hiddenMeaning: 'generated' }],
    ['missing names', { schemaVersion: 1, edges: [] }],
    ['non-array edges', { ...map(), edges: {} }],
    ['non-array names', { ...map(), names: null }],
    ['duplicate pair', { ...map(), edges: [makeThread(A, B), makeThread(B, A)] }],
    ['reversed endpoints', { ...map(), edges: [{ id: `${B}:${A}`, a: B, b: A }] }],
    ['self pair', { ...map(), edges: [{ id: `${A}:${A}`, a: A, b: A }] }],
    ['mismatched ID', { ...map(), edges: [{ ...makeThread(A, B), id: 'another' }] }],
    ['invalid endpoint', { ...map(), edges: [{ id: `${A}:unknown`, a: A, b: 'unknown' }] }],
    ['extra edge field', { ...map(), edges: [{ ...makeThread(A, B), completed: true }] }],
    ['duplicate name anchor', { ...map(), names: [{ anchorId: A, text: 'One' }, { anchorId: A, text: 'Two' }] }],
    ['invalid name anchor', { ...map(), names: [{ anchorId: 'unknown', text: 'One' }] }],
    ['empty name', { ...map(), names: [{ anchorId: A, text: '' }] }],
    ['whitespace name', { ...map(), names: [{ anchorId: A, text: ' \n\t ' }] }],
    ['over-limit Unicode name', { ...map(), names: [{ anchorId: A, text: '🪐'.repeat(101) }] }],
    ['extra name field', { ...map(), names: [{ anchorId: A, text: 'One', mood: 'hopeful' }] }],
  ])('rejects %s', (_label, value) => { expect(isUniverseMap(value)).toBe(false); });

  it('groups only manually connected visible stars, leaving an unconnected star outside groups', () => {
    const source: UniverseMap = { schemaVersion: 1, edges: [makeThread(C, D)!, makeThread(A, B)!], names: [] };
    expect(universeGroups(source, [E, D, C, B, A]).map(group => ({ id: group.id, stars: group.starIds }))).toEqual([
      { id: A, stars: [A, B] }, { id: C, stars: [C, D] },
    ]);
    expect(source.edges[0]).toEqual(makeThread(C, D));
  });
  it('keeps both authored names when groups join and follows each anchor when they split', () => {
    const source: UniverseMap = { schemaVersion: 1, edges: [makeThread(A, B)!, makeThread(C, D)!], names: [{ anchorId: A, text: 'The things I almost became' }, { anchorId: C, text: 'Little universes' }] };
    const joined = { ...source, edges: [...source.edges, makeThread(B, C)!] };
    expect(universeGroups(joined, [A, B, C, D])).toEqual([{ id: A, starIds: [A, B, C, D], edges: joined.edges, names: source.names }]);
    expect(universeGroups(source, [A, B, C, D]).map(group => group.names)).toEqual([[source.names[0]], [source.names[1]]]);
    expect(source.names.map(name => name.text)).toEqual(['The things I almost became', 'Little universes']);
  });
  it('preserves hidden threads and names in the map rather than inventing missing stars or deleting records', () => {
    const source: UniverseMap = { schemaVersion: 1, edges: [makeThread(A, B)!, makeThread(C, D)!], names: [{ anchorId: A, text: 'Still here' }, { anchorId: E, text: 'Another season' }] };
    const before = serializeUniverse(source);
    expect(universeGroups(source, [A, C, D, E])).toEqual([{ id: C, starIds: [C, D], edges: [source.edges[1]], names: [] }]);
    expect(serializeUniverse(source)).toBe(before);
    expect(universeGroups(source, [A, B, C, D, E])[0].names[0].text).toBe('Still here');
  });
  it('keeps cycles in one group without traversing a star twice', () => {
    const source = { ...emptyUniverse(), edges: [makeThread(A, B)!, makeThread(B, C)!, makeThread(C, A)!] };
    expect(universeGroups(source, [A, B, C])[0].starIds).toEqual([A, B, C]);
  });
});

describe('independent star-map storage', () => {
  it('constructs and loads an empty map without writing or deleting anything', () => {
    const { local, storage, loaded } = setup();
    expect(loaded).toEqual({ map: emptyUniverse(), baseline: null, blocked: false });
    expect(storage.load()).toEqual(loaded);
    expect(local.writes).toBe(0);
    expect(local.deletes).toBe(0);
  });
  it('requires a successful read before saving and never initializes storage implicitly', () => {
    const local = new MemoryStorage();
    const storage = createUniverseStorage(() => local);
    expect(storage.save(map(), null)).toMatchObject({ ok: false, reason: 'blocked' });
    expect(local.writes).toBe(0);
  });
  it('saves and reloads exact names in one independent key without changing exhibit or journal bytes', () => {
    const { local, storage } = setup();
    local.data.set(`almost:exhibit:${A}`, ' untouched exhibit bytes ');
    local.data.set(`almost:journal:entry:${A}`, ' untouched journal bytes ');
    const saved = storage.save(map(), null);
    expect(saved).toEqual({ ok: true, baseline: serializeUniverse(map()) });
    expect(storage.load()).toEqual({ map: map(), baseline: serializeUniverse(map()), blocked: false });
    expect(local.data.get(`almost:exhibit:${A}`)).toBe(' untouched exhibit bytes ');
    expect(local.data.get(`almost:journal:entry:${A}`)).toBe(' untouched journal bytes ');
    expect(local.deletes).toBe(0);
    expect(local.data.size).toBe(3);
  });
  it('does not duplicate or rewrite the same desired graph on a repeated save', () => {
    const { local, storage } = setup();
    expect(storage.save(map(), null).ok).toBe(true);
    expect(storage.save(map(), null).ok).toBe(true);
    expect(local.writes).toBe(1);
    expect(local.data.size).toBe(1);
  });
  it('acknowledges a semantically matching graph while retaining different raw formatting and array order', () => {
    const source: UniverseMap = { schemaVersion: 1, edges: [makeThread(A, B)!, makeThread(C, D)!], names: [{ anchorId: A, text: 'First' }, { anchorId: C, text: 'Second' }] };
    const { local, storage, loaded } = setup(source);
    const reordered = { ...source, edges: [...source.edges].reverse(), names: [...source.names].reverse() };
    expect(storage.save(reordered, null)).toEqual({ ok: true, baseline: loaded.baseline });
    expect(local.data.get(UNIVERSE_KEY)).toBe(loaded.baseline);
    expect(local.writes).toBe(0);
  });
  it.each(['{broken', JSON.stringify({ ...map(), schemaVersion: 2 }), JSON.stringify({ ...map(), names: [{ anchorId: A, text: '' }] })])('preserves unreadable or unsupported bytes and blocks writes: %s', raw => {
    const local = new MemoryStorage();
    local.data.set(UNIVERSE_KEY, raw);
    const storage = createUniverseStorage(() => local);
    const loaded = storage.load();
    expect(loaded).toMatchObject({ map: emptyUniverse(), baseline: raw, blocked: true });
    expect(loaded.error).toContain('left untouched');
    expect(storage.save(map(), raw)).toMatchObject({ ok: false, reason: 'blocked' });
    expect(local.data.get(UNIVERSE_KEY)).toBe(raw);
    expect(local.writes).toBe(0);
    expect(local.deletes).toBe(0);
  });
  it('checks stored validity again before every write and stays blocked until an explicit reread', () => {
    const { local, storage } = setup();
    local.data.set(UNIVERSE_KEY, '{broken');
    expect(storage.save(map(), null)).toMatchObject({ ok: false, reason: 'blocked' });
    local.data.delete(UNIVERSE_KEY);
    expect(storage.save(map(), null)).toMatchObject({ ok: false, reason: 'blocked' });
    expect(local.writes).toBe(0);
    expect(storage.load().blocked).toBe(false);
    expect(storage.save(map(), null).ok).toBe(true);
  });
  it('blocks writes when a storage provider or read is denied, then allows an explicit successful reread', () => {
    let denied = true;
    const local = new MemoryStorage();
    const storage = createUniverseStorage(() => { if (denied) throw new Error('provider denied'); return local; });
    expect(storage.load().blocked).toBe(true);
    denied = false;
    expect(storage.save(map(), null)).toMatchObject({ ok: false, reason: 'blocked' });
    expect(storage.load().blocked).toBe(false);
    local.failRead = true;
    expect(storage.save(map(), null)).toMatchObject({ ok: false, reason: 'blocked' });
    local.failRead = false;
    expect(storage.save(map(), null)).toMatchObject({ ok: false, reason: 'blocked' });
    expect(storage.load().blocked).toBe(false);
    expect(storage.save(map(), null).ok).toBe(true);
  });
  it('returns a write failure honestly and retries without changing the requested map', () => {
    const { local, storage } = setup();
    const desired = map();
    const exact = serializeUniverse(desired);
    local.failWrite = true;
    const failed = storage.save(desired, null);
    expect(failed).toMatchObject({ ok: false, reason: 'write' });
    if (!failed.ok) expect(failed.error).toContain('may disappear after a reload');
    expect(local.data.has(UNIVERSE_KEY)).toBe(false);
    expect(serializeUniverse(desired)).toBe(exact);
    local.failWrite = false;
    expect(storage.save(desired, null)).toEqual({ ok: true, baseline: exact });
  });
  it.each(['failAcknowledgement', 'mismatchAcknowledgement'] as const)('does not claim success after %s and safely acknowledges the same retry', failure => {
    const { local, storage } = setup();
    local[failure] = true;
    expect(storage.save(map(), null)).toMatchObject({ ok: false, reason: 'write' });
    expect(local.data.get(UNIVERSE_KEY)).toBe(serializeUniverse(map()));
    local[failure] = false;
    expect(storage.save(map(), null)).toEqual({ ok: true, baseline: serializeUniverse(map()) });
    expect(local.writes).toBe(1);
  });
  it('preserves a newer saved graph on a stale baseline, including when another tab clears the key', () => {
    const { local, storage, loaded } = setup(map());
    const newer = { ...map(), edges: [...map().edges, makeThread(B, C)!] };
    local.data.set(UNIVERSE_KEY, serializeUniverse(newer));
    const desired = { ...map(), names: [{ anchorId: A, text: 'My unsaved name' }] };
    expect(storage.save(desired, loaded.baseline)).toMatchObject({ ok: false, reason: 'conflict' });
    expect(local.data.get(UNIVERSE_KEY)).toBe(serializeUniverse(newer));
    local.data.delete(UNIVERSE_KEY);
    expect(storage.save(desired, loaded.baseline)).toMatchObject({ ok: false, reason: 'conflict' });
    expect(local.data.has(UNIVERSE_KEY)).toBe(false);
    expect(local.writes).toBe(0);
  });
  it('saves further edits after a failed acknowledgement only when the current graph matches a prior own attempt', () => {
    const { local, storage, loaded } = setup(map());
    local.data.set(`almost:exhibit:${A}`, ' existing exhibit bytes ');
    local.data.set(`almost:journal:entry:${A}`, ' existing journal bytes ');
    const attempt = { ...map(), edges: [...map().edges, makeThread(B, C)!] };
    local.failAcknowledgement = true;
    expect(storage.save(attempt, loaded.baseline)).toMatchObject({ ok: false, reason: 'write' });
    const edited = { ...attempt, names: [{ anchorId: A, text: '  Further words after retry 🌿  ' }] };
    local.failAcknowledgement = false;
    expect(storage.save(edited, loaded.baseline)).toMatchObject({ ok: false, reason: 'conflict' });
    expect(storage.save(edited, loaded.baseline, [attempt])).toEqual({ ok: true, baseline: serializeUniverse(edited) });
    expect(local.data.get(UNIVERSE_KEY)).toBe(serializeUniverse(edited));
    expect(local.data.get(`almost:exhibit:${A}`)).toBe(' existing exhibit bytes ');
    expect(local.data.get(`almost:journal:entry:${A}`)).toBe(' existing journal bytes ');
    expect(local.writes).toBe(2);
    expect(local.deletes).toBe(0);
  });
  it('does not treat a different external graph as a previous own write', () => {
    const { local, storage, loaded } = setup(map());
    const attempt = { ...map(), edges: [...map().edges, makeThread(B, C)!] };
    const external = { ...attempt, edges: [...attempt.edges, makeThread(C, D)!] };
    const raw = JSON.stringify(external, null, 2);
    local.data.set(UNIVERSE_KEY, raw);
    const edited = { ...attempt, names: [{ anchorId: A, text: 'My latest words' }] };
    expect(storage.save(edited, loaded.baseline, [attempt])).toMatchObject({ ok: false, reason: 'conflict' });
    expect(local.data.get(UNIVERSE_KEY)).toBe(raw);
    expect(local.writes).toBe(0);
  });
  it('ignores invalid and unsupported snapshots even when they otherwise describe the current graph', () => {
    const { local, storage } = setup(map());
    const edited = { ...map(), names: [{ anchorId: A, text: 'New words' }] };
    const invalid = [
      { ...map(), schemaVersion: 2 },
      { ...map(), extra: 'not a supported map' },
      { ...map(), names: [{ anchorId: A, text: 'x'.repeat(101) }] },
      null,
    ] as unknown as UniverseMap[];
    expect(storage.save(edited, null, invalid)).toMatchObject({ ok: false, reason: 'conflict' });
    expect(local.data.get(UNIVERSE_KEY)).toBe(JSON.stringify(map(), null, 2));
    expect(local.writes).toBe(0);
  });
  it('recognizes a previous own snapshot despite stored formatting, field order and graph array order', () => {
    const attempt: UniverseMap = { schemaVersion: 1, edges: [makeThread(A, B)!, makeThread(C, D)!], names: [{ anchorId: A, text: 'First' }, { anchorId: C, text: 'Second' }] };
    const { local, storage } = setup();
    local.data.set(UNIVERSE_KEY, JSON.stringify({ names: [...attempt.names].reverse(), edges: [...attempt.edges].reverse(), schemaVersion: 1 }, null, 2));
    const edited = { ...attempt, edges: [...attempt.edges, makeThread(B, C)!] };
    expect(storage.save(edited, null, [attempt])).toEqual({ ok: true, baseline: serializeUniverse(edited) });
    expect(local.writes).toBe(1);
  });
  it('never unblocks corrupt data or a removed key by supplying previous attempted writes', () => {
    const { local, storage, loaded } = setup(map());
    local.data.set(UNIVERSE_KEY, '{corrupt');
    expect(storage.save(emptyUniverse(), loaded.baseline, [map()])).toMatchObject({ ok: false, reason: 'blocked' });
    local.data.set(UNIVERSE_KEY, serializeUniverse(map()));
    expect(storage.save(emptyUniverse(), loaded.baseline, [map()])).toMatchObject({ ok: false, reason: 'blocked' });
    storage.load();
    local.data.delete(UNIVERSE_KEY);
    expect(storage.save(emptyUniverse(), loaded.baseline, [map(), emptyUniverse()])).toMatchObject({ ok: false, reason: 'conflict' });
    expect(local.writes).toBe(0);
  });
  it('rejects an invalid in-memory map before any storage mutation', () => {
    const { local, storage, loaded } = setup(map());
    const invalid = { ...map(), names: [{ anchorId: A, text: 'x'.repeat(101) }] };
    expect(storage.save(invalid, loaded.baseline)).toMatchObject({ ok: false, reason: 'invalid' });
    expect(local.data.get(UNIVERSE_KEY)).toBe(loaded.baseline);
    expect(local.writes).toBe(0);
  });
  it('allows an explicitly cleared map without deleting its independent storage key', () => {
    const { local, storage, loaded } = setup(map());
    expect(storage.save(emptyUniverse(), loaded.baseline)).toEqual({ ok: true, baseline: serializeUniverse(emptyUniverse()) });
    expect(local.data.get(UNIVERSE_KEY)).toBe(serializeUniverse(emptyUniverse()));
    expect(local.deletes).toBe(0);
  });
});

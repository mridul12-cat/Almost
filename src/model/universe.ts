import { codePointLength } from './validation';

export const CONSTELLATION_NAME_LIMIT = 100;
export interface StarThread { id: string; a: string; b: string }
export interface ConstellationName { anchorId: string; text: string }
export interface UniverseMap { schemaVersion: 1; edges: StarThread[]; names: ConstellationName[] }
export interface UniverseGroup { id: string; starIds: string[]; edges: StarThread[]; names: ConstellationName[] }

const validId = (id: unknown): id is string => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const exactKeys = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));

export function emptyUniverse(): UniverseMap { return { schemaVersion: 1, edges: [], names: [] }; }

/** The same unordered pair always identifies the same thread. */
export function makeThread(a: string, b: string): StarThread | null {
  if (!validId(a) || !validId(b) || a === b) return null;
  const [first, second] = a < b ? [a, b] : [b, a];
  return { id: `${first}:${second}`, a: first, b: second };
}

export function isUniverseMap(value: unknown): value is UniverseMap {
  if (!isObject(value) || !exactKeys(value, ['schemaVersion', 'edges', 'names']) || value.schemaVersion !== 1 || !Array.isArray(value.edges) || !Array.isArray(value.names)) return false;
  const threadIds = new Set<string>();
  for (const edge of value.edges) {
    if (!isObject(edge) || !exactKeys(edge, ['id', 'a', 'b']) || !validId(edge.a) || !validId(edge.b) || edge.a >= edge.b || edge.id !== `${edge.a}:${edge.b}` || threadIds.has(edge.id)) return false;
    threadIds.add(edge.id);
  }
  const namedAnchors = new Set<string>();
  for (const name of value.names) {
    if (!isObject(name) || !exactKeys(name, ['anchorId', 'text']) || !validId(name.anchorId) || namedAnchors.has(name.anchorId) || typeof name.text !== 'string' || !name.text.trim() || codePointLength(name.text) > CONSTELLATION_NAME_LIMIT) return false;
    namedAnchors.add(name.anchorId);
  }
  return true;
}

/** Connections alone define a group. Names follow their anchor when groups merge or split. */
export function universeGroups(map: UniverseMap, visibleStarIds: string[]): UniverseGroup[] {
  const visible = new Set(visibleStarIds);
  const adjacency = new Map<string, Set<string>>();
  for (const edge of map.edges) {
    if (!visible.has(edge.a) || !visible.has(edge.b)) continue;
    if (!adjacency.has(edge.a)) adjacency.set(edge.a, new Set());
    if (!adjacency.has(edge.b)) adjacency.set(edge.b, new Set());
    adjacency.get(edge.a)!.add(edge.b);
    adjacency.get(edge.b)!.add(edge.a);
  }
  const visited = new Set<string>();
  const groups: UniverseGroup[] = [];
  for (const start of [...adjacency.keys()].sort()) {
    if (visited.has(start)) continue;
    const queue = [start];
    const members = new Set<string>();
    visited.add(start);
    for (let index = 0; index < queue.length; index++) {
      const id = queue[index];
      members.add(id);
      for (const neighbor of adjacency.get(id) ?? []) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
    const starIds = [...members].sort();
    groups.push({
      id: starIds[0], starIds,
      edges: map.edges.filter(edge => members.has(edge.a) && members.has(edge.b)),
      names: map.names.filter(name => members.has(name.anchorId)),
    });
  }
  return groups;
}

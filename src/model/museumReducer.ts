import type { Draft, Exhibit } from './types';
export function upsertExhibit(records: Exhibit[], exhibit: Exhibit): Exhibit[] {
  return records.some(record => record.id === exhibit.id)
    ? records.map(record => record.id === exhibit.id ? exhibit : record)
    : [...records, exhibit];
}
export function setExhibitLight(records: Exhibit[], id: string, lightOn: boolean): Exhibit[] {
  return records.map(record => record.id === id ? { ...record, lightOn } : record);
}
export function reconcileDraft(draft: Draft | null, records: Exhibit[]): 'none' | 'resume' | 'completed' | 'conflict' {
  if (!draft) return 'none';
  const saved = records.find(record => record.id === draft.id);
  if (!saved) return 'resume';
  return saved.title === draft.title && saved.description === draft.description && saved.artifactType === draft.artifactType && saved.createdAt === draft.placedAt ? 'completed' : 'conflict';
}

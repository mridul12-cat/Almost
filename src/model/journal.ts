import { codePointLength } from './validation';

export const JOURNAL_TITLE_LIMIT = 100;
export const JOURNAL_BODY_LIMIT = 5000;
export interface JournalEntry {
  schemaVersion: 1;
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  timeZone: string;
}
export interface JournalDraft {
  schemaVersion: 1;
  id: string;
  title: string;
  body: string;
  createdAt: string | null;
  modifiedAt: string | null;
  timeZone: string;
  baseline: string | null;
}
export type JournalDraftErrors = Partial<Record<'title' | 'body', string>>;
export function createJournalDraft(id: string, timeZone: string): JournalDraft {
  return { schemaVersion: 1, id, title: '', body: '', createdAt: null, modifiedAt: null, timeZone, baseline: null };
}
export function validateJournalDraft(draft: Pick<JournalDraft, 'title' | 'body'>): JournalDraftErrors {
  const errors: JournalDraftErrors = {};
  if (codePointLength(draft.title) > JOURNAL_TITLE_LIMIT) errors.title = 'Keep the name within 100 characters. Your words are still here.';
  if (!draft.body.trim()) errors.body = 'Give this memory a few words before keeping it.';
  else if (codePointLength(draft.body) > JOURNAL_BODY_LIMIT) errors.body = 'Keep the memory within 5,000 characters. Your words are still here.';
  return errors;
}
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const exactKeys = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const validId = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const timestamp = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
function timeZone(value: unknown): value is string {
  if (typeof value !== 'string' || !/[A-Za-z]/.test(value)) return false;
  try { new Intl.DateTimeFormat('en', { timeZone: value }).format(0); return true; }
  catch { return false; }
}
export function isJournalEntry(value: unknown, expectedId?: string): value is JournalEntry {
  if (!object(value) || !exactKeys(value, ['schemaVersion', 'id', 'title', 'body', 'createdAt', 'updatedAt', 'timeZone'])) return false;
  return value.schemaVersion === 1 && validId(value.id) && (expectedId === undefined || expectedId === value.id)
    && typeof value.title === 'string' && typeof value.body === 'string' && !Object.keys(validateJournalDraft({ title: value.title, body: value.body })).length
    && timestamp(value.createdAt) && timestamp(value.updatedAt) && Date.parse(value.updatedAt) >= Date.parse(value.createdAt) && timeZone(value.timeZone);
}
export function isJournalDraft(value: unknown): value is JournalDraft {
  if (!object(value) || !exactKeys(value, ['schemaVersion', 'id', 'title', 'body', 'createdAt', 'modifiedAt', 'timeZone', 'baseline'])) return false;
  return value.schemaVersion === 1 && validId(value.id) && typeof value.title === 'string' && typeof value.body === 'string'
    && (value.createdAt === null || timestamp(value.createdAt)) && (value.modifiedAt === null || timestamp(value.modifiedAt))
    && (value.modifiedAt === null || (typeof value.createdAt === 'string' && Date.parse(value.modifiedAt) >= Date.parse(value.createdAt)))
    && timeZone(value.timeZone) && (value.baseline === null || typeof value.baseline === 'string');
}

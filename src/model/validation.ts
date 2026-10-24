import { ARTIFACT_TYPES, type ArtifactType, type Draft, type Exhibit } from './types';
export const TITLE_LIMIT = 100;
export const DESCRIPTION_LIMIT = 1000;
export const codePointLength = (value: string) => [...value].length;
export type DraftErrors = Partial<Record<'title' | 'description' | 'artifactType', string>>;
export function validateDraft(draft: Pick<Draft, 'title' | 'description' | 'artifactType'>): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.title.trim()) errors.title = 'Give your exhibit a name before placing it.';
  else if (codePointLength(draft.title) > TITLE_LIMIT) errors.title = 'Keep the title within 100 characters. Your words are still here.';
  if (!draft.description.trim()) errors.description = 'Give your exhibit a few words before placing it.';
  else if (codePointLength(draft.description) > DESCRIPTION_LIMIT) errors.description = 'Keep the description within 1,000 characters. Your words are still here.';
  if (!isArtifactType(draft.artifactType)) errors.artifactType = 'Choose a form for your exhibit.';
  return errors;
}
export const isArtifactType = (value: unknown): value is ArtifactType => typeof value === 'string' && ARTIFACT_TYPES.some(type => type === value);
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const exactKeys = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const validId = (id: unknown): id is string => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const validTimestamp = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
export function isExhibit(value: unknown, expectedId?: string): value is Exhibit {
  if (!isObject(value) || !exactKeys(value, ['schemaVersion', 'id', 'title', 'description', 'artifactType', 'lightOn', 'createdAt'])) return false;
  return value.schemaVersion === 1 && validId(value.id) && (expectedId === undefined || value.id === expectedId)
    && typeof value.title === 'string' && !!value.title.trim() && codePointLength(value.title) <= TITLE_LIMIT
    && typeof value.description === 'string' && !!value.description.trim() && codePointLength(value.description) <= DESCRIPTION_LIMIT
    && isArtifactType(value.artifactType) && typeof value.lightOn === 'boolean' && validTimestamp(value.createdAt);
}
export function isDraft(value: unknown): value is Draft {
  if (!isObject(value) || !exactKeys(value, ['schemaVersion', 'id', 'step', 'title', 'description', 'titleInitialized', 'artifactType', 'phase', 'placedAt'])) return false;
  return value.schemaVersion === 1 && validId(value.id) && typeof value.step === 'string' && ['remember', 'name', 'form'].includes(value.step)
    && typeof value.title === 'string' && typeof value.description === 'string' && typeof value.titleInitialized === 'boolean'
    && (value.artifactType === null || isArtifactType(value.artifactType))
    && (value.phase === 'creating' || value.phase === 'pending-save')
    && (value.placedAt === null || validTimestamp(value.placedAt))
    && (value.phase !== 'pending-save' || value.placedAt !== null);
}

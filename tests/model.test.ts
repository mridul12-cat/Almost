import { describe, expect, it } from 'vitest';
import { createDraft, type Exhibit } from '../src/model/types';
import { codePointLength, validateDraft } from '../src/model/validation';
import { suggestTitle } from '../src/model/naming';
import { reconcileDraft, setExhibitLight, upsertExhibit } from '../src/model/museumReducer';
const id = '00000000-0000-4000-8000-000000000001';
const exhibit: Exhibit = { schemaVersion: 1, id, title: 'My beginning', description: '  Garden 🌿\n  Paper', artifactType: 'plant', lightOn: false, createdAt: '2026-10-24T00:00:00.000Z' };
describe('authored words', () => {
  it('counts Unicode code points and never truncates over-limit words', () => {
    const draft = { ...createDraft(id), title: '✨'.repeat(101), description: 'x'.repeat(1001), artifactType: 'book' as const };
    expect(codePointLength('✨🌿')).toBe(2);
    expect(Object.keys(validateDraft(draft))).toEqual(['title', 'description']);
    expect(draft.title).toBe('✨'.repeat(101));
  });
  it('rejects whitespace-only words and missing artifact', () => {
    expect(Object.keys(validateDraft({ ...createDraft(id), title: ' \n', description: '\t' }))).toHaveLength(3);
  });
  it('copies the exact first nonempty short line, otherwise uses a neutral fallback', () => {
    expect(suggestTitle('\n  Paper 🌿  \nOther')).toBe('A beginning:   Paper 🌿  ');
    expect(suggestTitle('x'.repeat(61))).toBe('An Unfinished Beginning');
    expect(suggestTitle(' \n')).toBe('An Unfinished Beginning');
  });
});
describe('stable museum records', () => {
  it('upserts rather than duplicating and only explicit light changes alter the boolean', () => {
    const records = upsertExhibit(upsertExhibit([], exhibit), exhibit);
    expect(records).toEqual([exhibit]);
    expect(setExhibitLight(records, id, true)[0].lightOn).toBe(true);
    expect(records[0].lightOn).toBe(false);
  });
  it('reconciles a stale completed draft while ignoring legitimate light changes', () => {
    const draft = { ...createDraft(id), title: exhibit.title, description: exhibit.description, artifactType: exhibit.artifactType, placedAt: exhibit.createdAt, phase: 'pending-save' as const };
    expect(reconcileDraft(draft, [{ ...exhibit, lightOn: true }])).toBe('completed');
    expect(reconcileDraft({ ...draft, title: 'Unsaved words' }, [exhibit])).toBe('conflict');
    expect(reconcileDraft(draft, [])).toBe('resume');
    expect(reconcileDraft(null, [])).toBe('none');
  });
});

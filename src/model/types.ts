export const ARTIFACT_TYPES = ['book', 'spaceship', 'plant', 'music-box', 'canvas'] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];
export type CreationStep = 'remember' | 'name' | 'form';
export interface Exhibit {
  schemaVersion: 1;
  id: string;
  title: string;
  description: string;
  artifactType: ArtifactType;
  lightOn: boolean;
  createdAt: string;
}
export interface Draft {
  schemaVersion: 1;
  id: string;
  step: CreationStep;
  title: string;
  description: string;
  titleInitialized: boolean;
  artifactType: ArtifactType | null;
  phase: 'creating' | 'pending-save';
  placedAt: string | null;
}
export function createDraft(id: string): Draft {
  return { schemaVersion: 1, id, step: 'remember', title: '', description: '', titleInitialized: false, artifactType: null, phase: 'creating', placedAt: null };
}
export interface StorageLike {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

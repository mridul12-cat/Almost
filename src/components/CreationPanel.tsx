import type { Draft } from '../model/types';
import { ARTIFACT_TYPES } from '../model/types';
import { codePointLength, validateDraft } from '../model/validation';
import { Artifact } from './Artifact';
import { PipCurator } from './PipCurator';
import { PanelDialog } from './PanelDialog';

export const formName = (type: string) => type === 'music-box' ? 'Music box' : type.charAt(0).toUpperCase() + type.slice(1);
export function CreationPanel({ draft, busy, onChange, onNext, onPlace, onClose, notice }: { draft: Draft; busy: boolean; onChange: (changes: Partial<Draft>) => void; onNext: () => void; onPlace: () => void; onClose: () => void; notice: string }) {
  const errors = validateDraft(draft);
  const isRemember = draft.step === 'remember';
  const isName = draft.step === 'name';
  const title = isRemember ? 'What did you once begin?' : isName ? 'What shall we call it?' : 'Choose a little vessel.';
  const field = (name: 'title' | 'description', label: string, limit: number) => <div className="field">
    <label htmlFor={`exhibit-${name}`}>{label}</label>
    {name === 'title' ? <input id={`exhibit-${name}`} value={draft[name]} onChange={e => onChange({ [name]: e.target.value })} aria-describedby={`${name}-help`} aria-invalid={!!errors[name]} /> : <textarea id={`exhibit-${name}`} value={draft[name]} rows={isRemember ? 5 : 3} placeholder="That story about a tiny astronaut. The guitar in the corner. A garden you drew on a napkin…" onChange={e => onChange({ [name]: e.target.value })} aria-describedby={`${name}-help`} aria-invalid={!!errors[name]} />}
    <div id={`${name}-help`} className="field-help"><span>{errors[name] || (name === 'description' ? 'Your words, exactly as you write them.' : 'A name that feels like yours.')}</span><span>{codePointLength(draft[name])} / {limit.toLocaleString()}</span></div>
  </div>;
  return <PanelDialog title={title} kind="creation" onClose={onClose}>
    <ol className="creation-steps" aria-label="Creation steps">{['remember', 'name', 'form'].map((step, index) => <li key={step} aria-current={draft.step === step ? 'step' : undefined}><span className="step-dot" aria-hidden="true">{index + 1}</span><span>{['The Whisper', 'The Name Tag', 'A Vessel'][index]}</span></li>)}</ol>
    <div className="ritual-companion"><PipCurator mood="writing"/><p>{isRemember ? <>Pip’s listening.<br/><span>It can be one word, or a whole little story.</span></> : isName ? <>A little label, all your own.<br/><span>You can change every word.</span></> : <>Oh! There’s room for that.<br/><span>Choose a shape. You give it meaning.</span></>}</p></div>
    <form onSubmit={e => { e.preventDefault(); if (draft.step === 'form') onPlace(); else onNext(); }}>
      {isRemember && <div className="notebook-page">{field('description', 'Something you never quite finished', 1000)}<span className="notebook-corner" aria-hidden="true">✧</span></div>}
      {isName && <>{field('title', 'Exhibit title', 100)}<div className="name-tag-preview" aria-hidden="true"><span className="tag-hole"/><span>{draft.title || 'a beginning, unnamed'}</span><small>almost museum · a little keepsake</small></div><p className="template-note">A simple template starts the title. You decide what stays.</p>{field('description', 'Your exhibit description', 1000)}</>}
      {!isRemember && !isName && <><fieldset className="artifact-choices"><legend className="sr-only">Choose an artifact</legend>{ARTIFACT_TYPES.map(type => <label className={`artifact-choice ${draft.artifactType === type ? 'chosen' : ''}`} key={type}><input type="radio" name="artifact" value={type} checked={draft.artifactType === type} onChange={() => onChange({ artifactType: type })}/><Artifact type={type}/><span>{formName(type)}</span><span className="choice-mark" aria-hidden="true">{draft.artifactType === type ? '✓' : '·'}</span></label>)}</fieldset><p className="vessel-hint">Five little vessels. None of them needs to be finished.</p></>}
      {!isRemember && !isName && <p className="field-help">{errors.artifactType || 'Your keepsake is ready to find its place.'}</p>}
      {notice && <p className="inline-notice" role="status">{notice}</p>}
      <div className="panel-actions">{!isRemember ? <button type="button" className="text-button" onClick={() => onChange({ step: isName ? 'remember' : 'name' })}>← Back</button> : <span className="small-note">No perfect words needed.</span>}<button className="primary-button" type="submit" disabled={busy || (isRemember ? !!errors.description : isName ? !!errors.title || !!errors.description : Object.keys(errors).length > 0)}>{draft.step === 'form' ? (draft.phase === 'pending-save' ? 'Update & retry' : 'Place in Museum') : 'Continue'} <span aria-hidden="true">{draft.step === 'form' ? '✧' : '→'}</span></button></div>
    </form>
  </PanelDialog>;
}

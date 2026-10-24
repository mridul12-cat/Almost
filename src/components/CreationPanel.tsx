import type { Draft } from '../model/types';
import { ARTIFACT_TYPES } from '../model/types';
import { codePointLength, validateDraft } from '../model/validation';
import { Artifact } from './Artifact';
import { PanelDialog } from './PanelDialog';

export const formName = (type: string) => type === 'music-box' ? 'Music box' : type.charAt(0).toUpperCase() + type.slice(1);
export function CreationPanel({ draft, busy, onChange, onNext, onPlace, onClose, notice }: { draft: Draft; busy: boolean; onChange: (changes: Partial<Draft>) => void; onNext: () => void; onPlace: () => void; onClose: () => void; notice: string }) {
  const errors = validateDraft(draft);
  const isRemember = draft.step === 'remember';
  const isName = draft.step === 'name';
  const title = isRemember ? 'What did you once begin?' : isName ? 'Give it a name.' : 'Choose its form.';
  const field = (name: 'title' | 'description', label: string, limit: number) => <div className="field">
    <label htmlFor={`exhibit-${name}`}>{label}</label>
    {name === 'title' ? <input id={`exhibit-${name}`} value={draft[name]} onChange={e => onChange({ [name]: e.target.value })} aria-describedby={`${name}-help`} aria-invalid={!!errors[name]} /> : <textarea id={`exhibit-${name}`} value={draft[name]} rows={isRemember ? 5 : 4} placeholder="A novel with three chapters. A garden on the moon. A song still waiting for its last verse…" onChange={e => onChange({ [name]: e.target.value })} aria-describedby={`${name}-help`} aria-invalid={!!errors[name]} />}
    <div id={`${name}-help`} className="field-help"><span>{errors[name] || (name === 'description' ? 'Your words, exactly as you write them.' : 'Make it your own.')}</span><span>{codePointLength(draft[name])} / {limit.toLocaleString()}</span></div>
  </div>;
  return <PanelDialog title={title} kind="creation" onClose={onClose}>
    <ol className="creation-steps" aria-label="Creation steps">{['remember', 'name', 'form'].map((step, index) => <li key={step} aria-current={draft.step === step ? 'step' : undefined}><span>{['Remember', 'Name', 'Form'][index]}</span></li>)}</ol>
    <p className="panel-intro">{isRemember ? 'It doesn’t have to be finished to have meant something.' : isName ? 'A simple template offers a beginning. Every word is yours to change.' : 'A symbolic home for your idea. There is no right choice.'}</p>
    <form onSubmit={e => { e.preventDefault(); if (draft.step === 'form') onPlace(); else onNext(); }}>
      {isRemember && field('description', 'Something you never quite finished', 1000)}
      {isName && <>{field('title', 'Exhibit title', 100)}<p className="template-note">Template suggestion · no AI interpretation</p>{field('description', 'Your exhibit description', 1000)}</>}
      {!isRemember && !isName && <fieldset className="artifact-choices"><legend className="sr-only">Choose an artifact</legend>{ARTIFACT_TYPES.map(type => <label className={`artifact-choice ${draft.artifactType === type ? 'chosen' : ''}`} key={type}><input type="radio" name="artifact" value={type} checked={draft.artifactType === type} onChange={() => onChange({ artifactType: type })}/><Artifact type={type}/><span>{formName(type)}</span></label>)}</fieldset>}
      {!isRemember && !isName && <p className="field-help">{errors.artifactType || 'Your idea chooses its own shape.'}</p>}
      {notice && <p className="inline-notice" role="status">{notice}</p>}
      <div className="panel-actions">{!isRemember ? <button type="button" className="text-button" onClick={() => onChange({ step: isName ? 'remember' : 'name' })}>← Back</button> : <span className="small-note">No perfect words needed.</span>}
        <button className="primary-button" type="submit" disabled={busy || (isRemember ? !!errors.description : isName ? !!errors.title || !!errors.description : Object.keys(errors).length > 0)}>{draft.step === 'form' ? (draft.phase === 'pending-save' ? 'Update & retry' : 'Place in Museum') : 'Continue'} <span aria-hidden="true">{draft.step === 'form' ? '✧' : '→'}</span></button></div>
    </form>
  </PanelDialog>;
}

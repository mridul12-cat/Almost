import type { Draft } from '../model/types';
import { Artifact } from './Artifact';
import { PipCurator } from './PipCurator';
import { PanelDialog } from './PanelDialog';

/** A fourth visual stage only. It never adds a record or writes to storage. */
export function PlacementPreview({ draft, busy, onConfirm, onBack, onClose, warning }: { draft: Draft; busy: boolean; onConfirm: () => void; onBack: () => void; onClose: () => void; warning: string }) {
  return <PanelDialog title="A little place for it." kind="preview" onClose={onClose}>
    <div className="placement-preview-scene"><div className="preview-moonbeam" aria-hidden="true"/><div className="preview-keepsake"><Artifact type={draft.artifactType!} lightOn={false}/><div className="wooden-shelf"/><div className="preview-tag">{draft.title}</div></div><PipCurator mood="anticipation" className="preview-pip"/></div>
    <p className="preview-status">Preview only · not placed yet</p>
    <p className="preview-copy">Ready when you are.</p>
    {warning && <p className="inline-notice" role="status">{warning}</p>}
    <div className="panel-actions"><button className="text-button" onClick={onBack}>← Back to vessel</button><button className="primary-button" disabled={busy} onClick={onConfirm}>Place in Museum <span aria-hidden="true">✧</span></button></div>
  </PanelDialog>;
}

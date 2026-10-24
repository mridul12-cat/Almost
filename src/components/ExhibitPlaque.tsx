import type { Exhibit } from '../model/types';
import { Artifact } from './Artifact';
import { formName } from './CreationPanel';
import { PanelDialog } from './PanelDialog';
export function ExhibitPlaque({ exhibit, playing, saved, error, blocked, canEdit, onClose, onLight, onReplay, onRetry, onEdit }: { exhibit: Exhibit; playing: boolean; saved: boolean; error: string; blocked: boolean; canEdit: boolean; onClose: () => void; onLight: (on: boolean, animate?: boolean) => void; onReplay: () => void; onRetry: () => void; onEdit: () => void }) {
  return <PanelDialog title={exhibit.title} kind="plaque" onClose={onClose}>
    <div className="plaque-artifact"><Artifact type={exhibit.artifactType} lightOn={exhibit.lightOn} playing={playing}/></div>
    <span className="eyebrow exhibit-type">{formName(exhibit.artifactType)} · A preserved beginning</span>
    <p className="exhibit-description">{exhibit.description}</p>
    <div className="plaque-rule" aria-hidden="true">✧</div>
    <p className="light-caption">A little possibility, still here.</p>
    <button className="primary-button light-action" onClick={() => onLight(true, true)}>Leave a little light on <span aria-hidden="true">✧</span></button>
    <div className="light-controls"><button className="text-button" onClick={onReplay} disabled={playing}>↻ Relive the moment</button><label className="light-switch"><input type="checkbox" checked={exhibit.lightOn} onChange={e => onLight(e.target.checked)}/><span className="switch-track" aria-hidden="true"/><span>Light {exhibit.lightOn ? 'on' : 'off'}</span></label></div>
    <div className={`save-state ${saved ? '' : 'temporary'}`}><span>{saved ? 'Saved in this browser' : 'Temporary · not saved for your next visit'}</span>{error && <p role="status">{error}</p>}{!saved && <div className="recovery-actions"><button className="text-button" disabled={blocked} onClick={onRetry}>Retry saving</button>{canEdit && <button className="text-button" onClick={onEdit}>Continue editing</button>}</div>}</div>
  </PanelDialog>;
}

export function StatusNotice({ blocked, warning, draftWarning, message, onRecheck }: { blocked: boolean; warning: string; draftWarning: string; message: string; onRecheck: () => void }) {
  return <div className="status-region"><div role="status" aria-live="polite">{message && <p className="quiet-message">{message}</p>}</div>{blocked && <div className="storage-warning" role="status"><p>{warning}</p><button className="text-button" onClick={onRecheck}>Check again</button></div>}{draftWarning && <p className="draft-warning" role="status">{draftWarning}</p>}</div>;
}

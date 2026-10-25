import { useEffect, useRef, type ReactNode } from 'react';

export function PanelDialog({ title, kind, onClose, children }: { title: string; kind: 'creation' | 'plaque' | 'preview' | 'environment'; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    dialog.querySelector<HTMLElement>('h2')?.focus();
    const cancel = (event: Event) => { event.preventDefault(); closeRef.current(); };
    dialog.addEventListener('cancel', cancel);
    return () => {
      dialog.removeEventListener('cancel', cancel);
      dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  useEffect(() => { if (kind !== 'plaque') ref.current?.querySelector<HTMLElement>('h2')?.focus(); }, [title, kind]);
  return <dialog ref={ref} className={`panel-dialog ${kind}`} aria-labelledby={`${kind}-title`}>
    <div className="dialog-titlebar"><div className="panel-heading"><span className="eyebrow">{kind === 'environment' ? 'Found around the midnight museum' : kind === 'plaque' ? 'A keepsake from your museum' : kind === 'preview' ? 'One little moment before it belongs.' : 'Make a little place for it.'}</span><button className="icon-button close-button" onClick={onClose} aria-label="Close panel">×</button></div>
    <h2 id={`${kind}-title`} tabIndex={-1}>{title}</h2>
    </div><div className="dialog-content">{children}</div>
  </dialog>;
}

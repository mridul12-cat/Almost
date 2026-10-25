import { useEffect, useRef, useState } from 'react';
import type { Exhibit } from '../model/types';
import { Artifact } from './Artifact';

export function ExhibitGallery({ records, selectedId, revealId, playbackId, saved, onSelect }: { records: Exhibit[]; selectedId: string | null; revealId: string | null; playbackId: string | null; saved: Record<string, boolean>; onSelect: (id: string) => void }) {
  const [page, setPage] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const pages = Math.max(1, Math.ceil(records.length / 6));
  const selectionIndex = records.findIndex(e => e.id === selectedId);
  const effectivePage = Math.min(page, pages - 1);
  useEffect(() => {
    if (selectionIndex < 0) return;
    setPage(Math.floor(selectionIndex / 6));
    setMobileIndex(selectionIndex);
    if (window.matchMedia('(max-width: 959px)').matches) track.current?.querySelector<HTMLElement>(`[data-id="${selectedId}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' });
  }, [selectedId, selectionIndex]);
  const browseMobile = (direction: number) => {
    const next = Math.max(0, Math.min(records.length - 1, mobileIndex + direction));
    setMobileIndex(next);
    track.current?.querySelector<HTMLElement>(`[data-id="${records[next]?.id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const placeholders = Math.max(0, 6 - (records.length ? Math.min(6, records.length - effectivePage * 6) : 0));
  return <section className={`collection-stage ${records.length ? '' : 'awaiting-beginnings'}`} aria-label="Your museum collection">
    <div className="shelf-caption"><span>Your little collection</span><span aria-hidden="true">↘</span></div>
    <div className="exhibit-track" ref={track} onScroll={e => { if (window.innerWidth < 960) { const el = e.currentTarget; const first = el.firstElementChild as HTMLElement | null; if (first) setMobileIndex(Math.min(records.length - 1, Math.max(0, Math.round(el.scrollLeft / (first.offsetWidth + 20))))); } }}>
      {records.map((exhibit, index) => <div key={exhibit.id} data-id={exhibit.id} className={`exhibit-position position-${index % 6} ${Math.floor(index / 6) === effectivePage ? 'on-page' : 'off-page'} ${revealId === exhibit.id ? 'being-revealed' : ''} ${exhibit.lightOn ? 'shelf-lit' : ''}`}>
        <button id={`artifact-${exhibit.id}`} className={`exhibit-button ${selectedId === exhibit.id ? 'selected' : ''}`} aria-label={`View exhibit: ${exhibit.title}`} aria-pressed={selectedId === exhibit.id} onClick={() => onSelect(exhibit.id)}>
          <div className="artifact-display"><div className="reveal-spotlight"/><Artifact type={exhibit.artifactType} lightOn={exhibit.lightOn} playing={playbackId === exhibit.id} revealing={revealId === exhibit.id}/></div>
          <div className="wooden-shelf"><span className="shelf-nail"/><span className="shelf-nail"/></div>
          <div className="keepsake-tag"><span className="tag-hole"/><span className="pedestal-title">{exhibit.title}</span><span className="exhibit-marker">{!saved[exhibit.id] ? 'Temporary' : exhibit.lightOn ? '✧ Light on' : 'Light off'}</span></div>
        </button>
      </div>)}
      {Array.from({ length: placeholders }, (_, index) => <div className={`waiting-nook nook-${index} ${records.length ? 'collection-placeholder' : ''}`} key={`empty-${index}`} aria-hidden="true"><div className="waiting-sketch">{index === 0 ? <><span className="paper-star">✧</span><span className="waiting-words">a space for<br/>your almost</span></> : index === 1 ? <svg viewBox="0 0 90 90"><path d="m18 61 4-38 47 3 2 36Zm8-29 34 2-1 20-32-1Z"/><path d="m42 38 2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1Z"/></svg> : <span className="empty-spark">{index % 2 ? '·' : '✧'}</span>}</div><div className="wooden-shelf"><span className="shelf-nail"/><span className="shelf-nail"/></div></div>)}
    </div>
    {records.length > 0 && <><nav className="desktop-browse" aria-label="Collection browsing"><button className="icon-button" aria-label="Previous exhibits" disabled={effectivePage === 0} onClick={() => setPage(effectivePage - 1)}>←</button><span>{effectivePage * 6 + 1}–{Math.min(records.length, (effectivePage + 1) * 6)} <span className="muted">of {records.length}</span></span><button className="icon-button" aria-label="Next exhibits" disabled={effectivePage >= pages - 1} onClick={() => setPage(effectivePage + 1)}>→</button></nav><nav className="mobile-browse" aria-label="Mobile collection browsing"><button className="icon-button" aria-label="Previous exhibit" disabled={mobileIndex === 0} onClick={() => browseMobile(-1)}>←</button><span>{Math.min(records.length, mobileIndex + 1)} <span className="muted">of {records.length}</span></span><button className="icon-button" aria-label="Next exhibit" disabled={mobileIndex >= records.length - 1} onClick={() => browseMobile(1)}>→</button></nav></>}
  </section>;
}

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
    if (window.matchMedia('(max-width: 767px)').matches) track.current?.querySelector<HTMLElement>(`[data-id="${selectedId}"]`)?.scrollIntoView({block:'nearest', inline:'center', behavior:'instant'});
  }, [selectedId, selectionIndex]);
  const browseMobile = (direction: number) => {
    const next = Math.max(0, Math.min(records.length - 1, mobileIndex + direction));
    setMobileIndex(next);
    track.current?.children[next]?.scrollIntoView({block: 'nearest', inline:'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  };
  return <section className="collection-stage" aria-label="Your museum collection">
    {records.length === 0 ? <div className="empty-display" aria-hidden="true"><div className="empty-spotlight"/><div className="empty-artifact"><svg viewBox="0 0 100 100"><path d="M50 17v18m0 30v18M17 50h18m30 0h18M28 28l12 12m20 20 12 12M28 72l12-12m20-20 12-12"/><path d="M50 35q0 15 15 15-15 0-15 15 0-15-15-15 15 0 15-15Z"/></svg></div><div className="pedestal empty-pedestal"><div className="pedestal-top"/><div className="pedestal-face"><span>YOUR FIRST BEGINNING</span></div><div className="pedestal-foot"/></div><div className="display-shadow"/></div> : <>
      <div className="exhibit-track" ref={track} onScroll={e => { if (window.innerWidth < 768) {const el = e.currentTarget; const first = el.firstElementChild as HTMLElement | null; if (first) setMobileIndex(Math.round(el.scrollLeft / (first.offsetWidth + 24)));} }}>
        {records.map((exhibit, index) => <div key={exhibit.id} data-id={exhibit.id} className={`exhibit-position position-${index % 6} ${Math.floor(index / 6) === effectivePage ? 'on-page' : 'off-page'} ${revealId === exhibit.id ? 'being-revealed' : ''}`}>
          <button id={`artifact-${exhibit.id}`} className={`exhibit-button ${selectedId === exhibit.id ? 'selected' : ''}`} aria-label={`View exhibit: ${exhibit.title}`} aria-pressed={selectedId === exhibit.id} onClick={() => onSelect(exhibit.id)}>
            <div className="artifact-display"><div className="reveal-spotlight"/><Artifact type={exhibit.artifactType} lightOn={exhibit.lightOn} playing={playbackId === exhibit.id} revealing={revealId === exhibit.id}/></div><div className="pedestal"><div className="pedestal-top"/><div className="pedestal-face"><span className="exhibit-number">{String(index + 1).padStart(2, '0')}</span><span className="pedestal-title">{exhibit.title}</span><span className="exhibit-marker">{!saved[exhibit.id] ? 'Temporary' : exhibit.lightOn ? '✧ Light on' : 'Light off'}</span></div><div className="pedestal-foot"/></div>
          </button>
        </div>)}
      </div>
      <nav className="desktop-browse" aria-label="Collection browsing"><button className="icon-button" aria-label="Previous exhibits" disabled={effectivePage === 0} onClick={() => setPage(effectivePage - 1)}>←</button><span>{effectivePage * 6 + 1}–{Math.min(records.length, (effectivePage + 1) * 6)} <span className="muted">of {records.length}</span></span><button className="icon-button" aria-label="Next exhibits" disabled={effectivePage >= pages - 1} onClick={() => setPage(effectivePage + 1)}>→</button></nav>
      <nav className="mobile-browse" aria-label="Mobile collection browsing"><button className="icon-button" aria-label="Previous exhibit" disabled={mobileIndex === 0} onClick={() => browseMobile(-1)}>←</button><span>{Math.min(records.length, mobileIndex + 1)} <span className="muted">of {records.length}</span></span><button className="icon-button" aria-label="Next exhibit" disabled={mobileIndex >= records.length - 1} onClick={() => browseMobile(1)}>→</button></nav>
    </>}
  </section>;
}

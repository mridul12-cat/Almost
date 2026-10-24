import type { ReactNode } from 'react';
import { MuseumAtmosphere } from './MuseumAtmosphere';
import { PipCurator } from './PipCurator';

export function MuseumScene({ children, count, hasDraft, onCreate, placing = false, remembering = false, lightCount = 0, onSkipReveal }: { children: ReactNode; count: number; hasDraft: boolean; onCreate: () => void; placing?: boolean; remembering?: boolean; lightCount?: number; onSkipReveal?: () => void }) {
  return <main className={`museum ${count ? 'inhabited' : 'empty'} ${placing ? 'is-placing' : ''} ${lightCount ? 'has-lights' : ''}`} id="museum" tabIndex={-1}>
    <div className="museum-intro"><div><span className="little-caption"><span aria-hidden="true">☾</span> A tiny museum. Open all night.</span><h1>A little place<br/>for your <span>almosts.</span></h1></div><p>Some things are worth keeping, <br/>even unfinished.<span className="intro-scribble" aria-hidden="true">That includes yours.</span></p></div>
    <div className="diorama">
      <MuseumAtmosphere/>
      <div className="room-sign" aria-hidden="true"><span>The Midnight</span><strong>Keepsake Museum</strong><i>beginnings welcome here</i></div>
      <div className="room-constellation" aria-hidden="true">{Array.from({ length: Math.min(count, 12) }, (_, i) => <i key={i} style={{ left: `${8 + (i * 29) % 85}%`, top: `${8 + (i * 17) % 50}%`, transform: `rotate(${i * 19}deg)` }}>✦</i>)}</div>
      <div className="keeper-corner"><PipCurator mood={placing ? 'placing' : remembering ? 'light' : count ? 'idle' : 'welcome'} showNote/><span className="keeper-tag">Pip <span>keeper of almost</span></span></div>
      <div className="writing-desk"><span className="desk-note">{count ? 'There’s room for one more.' : 'Every unfinished thing began somewhere.'}</span><button className="primary-button museum-create" onClick={onCreate} disabled={placing}><span>{hasDraft ? 'Continue where you left off' : count ? '+ Add an Exhibit' : 'Create your first exhibit'}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 17 1-5L17 1l5 5-11 11-6 1Zm1-5 5 5M3 21h17"/></svg></button><p>Make a little place for it.</p></div>
      {children}
      {placing && <div className="placement-ceremony" role="status"><span aria-hidden="true">✧</span><p>A little place, just for this.</p><button className="text-button" onClick={onSkipReveal}>Open its keepsake card</button></div>}
      <span className="room-caption" aria-hidden="true">a home for things that never quite became</span>
    </div>
    <p className="museum-footnote"><span aria-hidden="true">✧</span> Nothing here needs an ending.</p>
  </main>;
}

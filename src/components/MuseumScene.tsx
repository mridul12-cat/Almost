import type { ReactNode } from 'react';
import { MuseumAtmosphere } from './MuseumAtmosphere';
import type { PipMood } from './PipCurator';
import { MuseumEnvironment } from './MuseumEnvironment';

export function MuseumScene({ children, count, hasDraft, onCreate, placing = false, pipMood = 'sleepy', pipSpeaking = false, lightCount = 0, onSkipReveal }: { children: ReactNode; count: number; hasDraft: boolean; onCreate: () => void; placing?: boolean; pipMood?: PipMood; pipSpeaking?: boolean; lightCount?: number; onSkipReveal?: () => void }) {
  return <main className={`museum ${count ? 'inhabited' : 'empty'} ${placing ? 'is-placing' : ''} ${lightCount ? 'has-lights' : ''}`} id="museum" tabIndex={-1}>
    <div className="museum-intro"><div><span className="little-caption">The Midnight Keepsake Museum · Main Hall</span><h1>A whole world of <span>almost.</span></h1></div><p>Every unfinished thing began somewhere. <br/>Give something you once started a place to exist.</p></div>
    <div className="diorama museum-hall">
      <MuseumAtmosphere/>
      <div className="hall-heading" aria-hidden="true"><span>I</span> The Hall of Beginnings <span>✧</span></div>
      <div className="moonlight-layer" aria-hidden="true"/>
      <div className="room-motes" aria-hidden="true"><i/><i/><i/></div>
      <MuseumEnvironment pipMood={pipMood} pipSpeaking={pipSpeaking}/>
      <div className={`writing-desk ${placing ? 'placement-ceremony' : ''}`} role={placing ? 'status' : undefined}><span className="desk-note">{placing ? 'A little place, just for this.' : hasDraft ? 'Your notebook is still open.' : count ? 'There’s room for one more.' : 'A little place, waiting for you.'}</span>{placing ? <button className="primary-button" onClick={onSkipReveal}>Open its keepsake card <span aria-hidden="true">✧</span></button> : <button className="primary-button museum-create" onClick={onCreate}><span>{hasDraft ? 'Continue where you left off' : count ? '+ Add an Exhibit' : 'Create your first exhibit'}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 17 1-5L17 1l5 5-11 11-6 1Zm1-5 5 5M3 21h17"/></svg></button>}</div>
      {children}
      <div className="foreground-balustrade" aria-hidden="true"><i/><i/></div>
      <p className="hall-invitation">Take a look around. A few things here remember how to glow.</p>
    </div>
  </main>;
}

import { useEffect, useRef, useState } from 'react';
import { PanelDialog } from './PanelDialog';
import { PipCurator, type PipMood } from './PipCurator';

type FoundStory = 'guestbook' | 'note' | 'pedestal' | 'pip';
const stories: Record<FoundStory, { title: string; text: string; caption: string }> = {
  guestbook: { title: 'The guestbook, left open.', text: 'To whoever found this place:\n\nYou do not need a finished thing to belong here. A first page, a few notes, a shape you once imagined — there is room for all of it.', caption: 'A welcome written by the curator · no names required' },
  note: { title: 'A note from the curator.', text: 'We keep beginnings here.\n\nNot because they must become something else, but because they were something already. Take your time. The museum has no closing bell.', caption: 'Pinned beside the keepsake desk' },
  pedestal: { title: 'A place for what might have been.', text: 'An empty pedestal is not a missing story.\n\nIt is a little space for something that has not found its way here yet.', caption: 'Every unfinished thing began somewhere.' },
  pip: { title: 'A word from Pip.', text: '“I keep the lamps company. You can keep whatever beginning you like.”', caption: 'Pip · curator of small possibilities' },
};

/** Optional room discoveries. This component never reads or writes exhibit/draft storage. */
export function MuseumEnvironment({ pipMood, pipSpeaking }: { pipMood: PipMood; pipSpeaking: boolean }) {
  const [lampOn, setLampOn] = useState(true);
  const [moment, setMoment] = useState<'window' | 'bell' | null>(null);
  const [story, setStory] = useState<FoundStory | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function discover(next: 'window' | 'bell') {
    if (timer.current) clearTimeout(timer.current);
    setMoment(next);
    timer.current = setTimeout(() => setMoment(null), 3000);
  }
  return <>
    <div className={`window-discovery ${moment === 'window' ? 'is-twinkling' : ''}`}>
      <span className="window-stars" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>·</i></span>
      <button className="room-object window-touch" onClick={() => discover('window')} aria-label="Look through the twilight window"><span className="object-label">The window alcove</span></button>
    </div>
    <div className="curator-arrangement">
    <div className="keeper-corner"><button className="pip-greeting" aria-label="Ask Pip for a little thought" onClick={() => setStory('pip')}><PipCurator mood={pipMood} showNote={pipSpeaking}/><span className="object-label">Pip, your curator</span></button></div>
    <div className={`desk-lamp ${lampOn ? 'lamp-on' : ''}`}>
      <div className="desk-lamp-pool" aria-hidden="true"/>
      <button className="room-object lamp-touch" aria-label="Desk lamp" aria-pressed={lampOn} onClick={() => setLampOn(on => !on)}>
        <svg viewBox="0 0 100 140" aria-hidden="true"><path d="M49 50v67m-24 8h51M30 118h39" fill="none" stroke="#c7a375" strokeWidth="6" strokeLinecap="round"/><path d="M16 55Q20 6 49 8q31 2 36 47Z" fill={lampOn ? '#efd593' : '#8c9275'} stroke="#a68459" strokeWidth="3"/><path d="M24 52h53" stroke="#fff0c1" strokeWidth="3"/><path d="m44 59 1 8" stroke="#dbc38d" strokeWidth="2"/></svg>
        <span className="object-label">Lamp {lampOn ? 'on' : 'off'}</span>
      </button>
    </div>
    <div className="desk-discoveries">
      <button className={`room-object bell-touch ${moment === 'bell' ? 'is-ringing' : ''}`} aria-label="Ring the museum bell" onClick={() => discover('bell')}><svg viewBox="0 0 80 70" aria-hidden="true"><path d="M37 15V9h7v6M12 52q0-33 28-33t28 33Z" fill="#d0ab6c" stroke="#795e40" strokeWidth="3"/><path d="M7 56h66" stroke="#edd19b" strokeWidth="5" strokeLinecap="round"/><path d="M19 45q1-16 14-20" fill="none" stroke="#f4d899" strokeWidth="3"/><g className="bell-ring-marks" fill="none" stroke="#f7d99e" strokeWidth="2"><path d="M5 29 0 23m75 6 5-6M4 40H0m76 0h4"/></g></svg><span className="object-label">A quiet bell</span></button>
      <button className="room-object guestbook-touch" aria-label="Open the guestbook" onClick={() => setStory('guestbook')}><svg viewBox="0 0 120 80" aria-hidden="true"><path d="m5 18 49-7 12 2 48-4v59l-49 8-13-2L5 78Z" fill="#8c6854" stroke="#4a5146" strokeWidth="2"/><path d="m9 13 45-8 11 6 44-7v56l-44 8-11-5-45 8Z" fill="#efe0bb" stroke="#c2a783" strokeWidth="2"/><path d="M55 10v50m13-41 30-5m-30 15 27-5m-27 15 30-5M19 26l26-5m-26 15 26-5m-26 15 22-4" stroke="#b3a27e" fill="none" strokeWidth="2"/></svg><span className="object-label">The guestbook</span></button>
      <button className="room-object curator-note" aria-label="Read the curator’s note" onClick={() => setStory('note')}><svg viewBox="0 0 70 85" aria-hidden="true"><path d="m8 7 52-3 2 70-51 6Z" fill="#e8d8b8" stroke="#b69d77" strokeWidth="2"/><circle cx="35" cy="10" r="3" fill="#a97d55"/><path d="m18 28 30-2m-30 10 31-2m-30 11 25-2m-23 12 19-2" stroke="#8b9476" strokeWidth="2"/></svg><span className="object-label">Curator’s note</span></button>
    </div>
    </div>
    <button className="room-object empty-pedestal-touch" aria-label="Read the empty pedestal inscription" onClick={() => setStory('pedestal')}><svg viewBox="0 0 110 150" aria-hidden="true"><ellipse cx="55" cy="140" rx="50" ry="7" fill="#10282b" opacity=".3"/><path d="m20 52 71-4-6 85-60 2Z" fill="#8f9b81" stroke="#475d50" strokeWidth="2"/><path d="M30 60v63m13-64v64m13-65v64m13-66v64m12-64-2 64" stroke="#b2b59a" strokeWidth="3"/><path d="m12 43 82-4 5 14-85 5Zm7 84 69-3 5 13-76 4Z" fill="#b4b89a" stroke="#526754" strokeWidth="2"/><path d="m50 9 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" fill="#e8d29c"/></svg><span className="object-label">Still possible</span></button>
    <div className="environment-whisper" role="status" aria-live="polite">{moment && <span>{moment === 'window' ? 'Somewhere, the night is still full of possibilities.' : 'A little ring, seen rather than heard. Nothing here is late.'}</span>}</div>
    {story && <PanelDialog kind="environment" title={stories[story].title} onClose={() => setStory(null)}>
      <div className={story === 'guestbook' ? 'museum-story open-guestbook' : 'museum-story'}><span className="story-flourish" aria-hidden="true">☾ ✧</span><p>{stories[story].text}</p><small>{stories[story].caption}</small></div>
      <div className="panel-actions"><span className="small-note">A discovery, just for now.</span><button className="primary-button" onClick={() => setStory(null)}>Back to the hall</button></div>
    </PanelDialog>}
  </>;
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MuseumRoom } from '../model/rooms';

const TRACKS: Record<MuseumRoom, { file: string; label: string }> = {
  hall: { file: 'main-hall.mp3', label: 'Main Hall' },
  conservatory: { file: 'conservatory.mp3', label: 'Conservatory' },
  observatory: { file: 'observatory.mp3', label: 'Observatory' },
};

/** One player for the whole museum. Playback intent lasts only until this page closes. */
export function RoomMusic({ room }: { room: MuseumRoom }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const wanted = useRef(false);
  const attempt = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const track = TRACKS[room];

  const start = useCallback((audio: HTMLAudioElement, destination: MuseumRoom) => {
    attempt.current += 1;
    const ticket = attempt.current;
    const source = `${import.meta.env.BASE_URL}music/${TRACKS[destination].file}`;
    if (audio.getAttribute('src') !== source || audio.error) {
      audio.src = source;
      audio.load();
    }
    setStarting(true);
    setError('');
    void audio.play().catch(() => {
      // A pause or room change can cancel an in-flight play request normally.
      if (ticket !== attempt.current || !wanted.current) return;
      wanted.current = false;
      setPlaying(false);
      setStarting(false);
      setError('The music couldn’t start. Tap the music box to try again.');
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current!;
    attempt.current += 1;
    audio.pause();
    audio.volume = 0.35;
    setPlaying(false);
    setStarting(false);
    setError('');
    if (wanted.current) start(audio, room);
    return () => {
      attempt.current += 1;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, [room, start]);

  const toggle = () => {
    const audio = audioRef.current!;
    if (wanted.current) {
      wanted.current = false;
      attempt.current += 1;
      audio.pause();
      setPlaying(false);
      setStarting(false);
      setError('');
    } else {
      wanted.current = true;
      start(audio, room);
    }
  };

  return <aside className={`room-music music-${room} ${playing ? 'is-playing' : ''}`} aria-label="Room music">
    <audio ref={audioRef} loop preload="none" aria-hidden="true"
      onPlaying={event => {
        if (!wanted.current || event.currentTarget.paused) return;
        setPlaying(true);
        setStarting(false);
      }}
      onPause={() => setPlaying(false)}
      onWaiting={() => { setPlaying(false); setStarting(wanted.current); }}
      onError={event => {
        if (!event.currentTarget.error) return;
        wanted.current = false;
        attempt.current += 1;
        setPlaying(false);
        setStarting(false);
        setError('This room’s music is resting for now. Tap the music box to retry.');
      }}/>
    <button className="music-box-control" onClick={toggle} aria-pressed={playing}
      aria-label={`${playing || starting ? 'Pause' : 'Play'} ${track.label} music`} aria-describedby="room-music-feedback">
      <svg className="little-music-box" viewBox="0 0 110 92" fill="none" aria-hidden="true">
        <ellipse cx="54" cy="83" rx="38" ry="5" fill="#112e3038"/>
        <g className="music-box-body" stroke="#755b45" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 48 18 72q0 7 9 7h54q8 0 9-6l-3-25Z" fill="#ba855e"/>
          <path d="M24 78v4m57-4v4" strokeWidth="4"/>
          <path d="m22 47 8-13h47l10 13v6H22Z" fill="#e3bb7f"/>
          <path d="m29 36 2-20q1-5 7-5h35q6 0 6 5l-2 20Z" fill="#719183"/>
          <path d="M38 29V18h32v11" stroke="#d8d4a4"/>
          <path d="m55 16 2 4 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1Z" fill="#f4d895" stroke="none"/>
          <g className="music-record">
            <ellipse cx="53" cy="45" rx="20" ry="7" fill="#344c4e"/>
            <ellipse cx="53" cy="45" rx="13" ry="4" stroke="#82918a" strokeWidth="1"/>
            <ellipse cx="53" cy="45" rx="5" ry="2" fill="#eed195" stroke="none"/>
            <path d="m38 43 4 1m20 3 5 1" stroke="#b3bfa5" strokeWidth="1"/>
          </g>
          <path d="m79 37-6 10-9 1" stroke="#ebd496" strokeWidth="3"/>
          <path d="M35 62q3 4 6 0m25 0q3 4 6 0" stroke="#354f4a"/>
          <path d="M49 67q5 5 10 0" stroke="#354f4a"/>
          <ellipse cx="35" cy="68" rx="4" ry="2" fill="#dba08b" stroke="none"/>
          <ellipse cx="74" cy="68" rx="4" ry="2" fill="#dba08b" stroke="none"/>
          <path d="M90 62h6v8h-4" stroke="#e9c88b" strokeWidth="3"/>
        </g>
        <g className="music-note music-note-one" fill="#efd59b"><path d="M9 32V20l10-3v11h-2v-8l-6 2v10Z"/><ellipse cx="7" cy="33" rx="4" ry="3"/><ellipse cx="15" cy="29" rx="4" ry="3"/></g>
        <g className="music-note music-note-two" fill="#efd59b"><path d="M95 25V13l8 4-1 2-5-3v9Z"/><ellipse cx="93" cy="26" rx="4" ry="3"/></g>
      </svg>
      <span className="music-box-label"><strong>A little room music</strong><span>{track.label} · {starting ? 'Starting… tap to pause' : playing ? 'Playing · tap to pause' : 'Quiet · tap to play'}</span></span>
      <span className="music-state-symbol" aria-hidden="true">{playing || starting ? 'Ⅱ' : '▷'}</span>
    </button>
    <p id="room-music-feedback" className={error ? 'music-feedback' : 'sr-only'} role="status">{error || (playing ? `${track.label} music is playing.` : starting ? 'Starting the room music.' : 'Music is off. It only starts when you choose.')}</p>
  </aside>;
}

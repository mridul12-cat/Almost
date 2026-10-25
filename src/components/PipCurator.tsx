import { useId } from 'react';
import '../styles/pip.css';

export type PipMood = 'sleepy' | 'welcome' | 'listening' | 'anticipation' | 'happy' | 'looking' | 'settling' | 'idle' | 'writing' | 'placing' | 'light';
interface PipCuratorProps { mood?: PipMood; className?: string; showNote?: boolean }
const aliases: Partial<Record<PipMood, PipMood>> = { idle: 'sleepy', writing: 'listening', placing: 'happy', light: 'looking' };
const notes: Partial<Record<PipMood, string>> = {
  welcome: "Oh! There's room for that.",
  happy: "We can keep it here.",
  looking: 'A little light? Good idea.',
};

/** Pip is original local artwork. Every expression is decorative and has no storage effects. */
export function PipCurator({ mood = 'sleepy', className = '', showNote = false }: PipCuratorProps) {
  const pose = aliases[mood] ?? mood;
  const note = showNote ? notes[pose] : undefined;
  const id = `pip-${useId().replace(/:/g, '')}`;
  return <figure className={`pip-curator pip-${pose} ${className}`} data-pip-mood={pose}>
    <svg className="pip-portrait" viewBox="0 0 260 240" role="img" aria-label="Pip, the sleepy little curator cat">
      <defs>
        <linearGradient id={`${id}-fur`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#fff1d8"/><stop offset="1" stopColor="#e6caa7"/></linearGradient>
        <linearGradient id={`${id}-scarf`} x1="0" x2="1"><stop stopColor="#708c7e"/><stop offset="1" stopColor="#3f6863"/></linearGradient>
        <radialGradient id={`${id}-light`}><stop stopColor="#ffdf95" stopOpacity=".55"/><stop offset="1" stopColor="#ffdf95" stopOpacity="0"/></radialGradient>
      </defs>
      <ellipse cx="132" cy="214" rx="86" ry="12" fill="#152c3b" opacity=".13"/>
      <g className="pip-body" stroke="#384b54" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
        <path className="pip-tail" d="M171 191c39 9 52-7 46-27-4-13-24-15-28-2-4 11 8 15 13 9" fill="none" stroke="#d6b794" strokeWidth="19"/>
        <path className="pip-tail-outline" d="M171 201c34 8 62-3 57-31-3-19-22-28-35-15m-14 30c15 6 30 4 27-8" fill="none" strokeWidth="2"/>
        <path d="M91 139c-14 20-23 52-10 65 13 11 81 13 94-1 14-16-1-48-20-65Z" fill={`url(#${id}-fur)`}/>
        <path d="M112 163c-8 16-8 34 3 39 9 5 26 3 30-7 4-10-3-23-10-30" fill="#f8e6c9" stroke="none"/>
        <path d="M82 196c-8 2-10 13-1 15h26c6-1 6-8 0-12m45-1c-6 2-7 11 0 13h24c9-4 6-12-2-14" fill="#f1d9b8"/>
        <path d="m88 204 1 5m8-5 1 5m62-4v5m8-6 1 5" stroke="#baa185" strokeWidth="1.6"/>
        <g className="pip-head">
          <path d="M70 90c-9-13-11-44-4-51 7-5 24 7 35 18 16-4 38-6 54-1 13-14 31-25 38-19 7 7 5 35-1 51 14 18 17 43 4 58-22 27-94 29-122 4-18-16-17-43-4-60Z" fill={`url(#${id}-fur)`}/>
          <path className="pip-ear-left" d="M71 50c-2 9 0 20 4 28l15-14Z" fill="#dfa697" stroke="none"/><path className="pip-ear-right" d="m181 49-16 15 17 12c3-9 4-19 3-25Z" fill="#dfa697" stroke="none"/>
          <path d="M113 57c-3 11-1 21 6 23 7-2 7-14 7-25m8 0c0 11 1 18 7 20 6-2 7-9 8-18" fill="#b9adba" stroke="none" opacity=".8"/>
          <ellipse cx="86" cy="125" rx="12" ry="7" fill="#e7ac99" opacity=".6" stroke="none"/><ellipse cx="170" cy="123" rx="12" ry="7" fill="#e7ac99" opacity=".6" stroke="none"/>
          <g className="pip-eyes"><path d="M89 109c5-6 11-6 17-1m44-1c6-5 12-4 17 1" fill="none" strokeWidth="3.4"/><path d="m93 112 1 5m8-6v5m52-6v5m9-4-1 5" strokeWidth="2.4"/></g>
          <path className="pip-sleepy-eyes" d="M89 113q9 7 18-1m41-1q10 7 19-1" fill="none" strokeWidth="2.8"/>
          <g className="pip-bright-eyes" fill="#34454f" stroke="none"><ellipse cx="99" cy="110" rx="4" ry="6"/><ellipse cx="157" cy="109" rx="4" ry="6"/><circle cx="100" cy="108" r="1.4" fill="#fff2dc"/><circle cx="158" cy="107" r="1.4" fill="#fff2dc"/></g>
          <path className="pip-happy-smile" d="M118 132q9 9 18-1" fill="none" strokeWidth="2"/>
          <path d="m123 121 7 1-4 5Z" fill="#ac7c76" stroke="#ac7c76" strokeWidth="1"/><path d="M126 128c0 6-6 7-9 3m9-3c0 6 7 7 10 2" fill="none" strokeWidth="1.8"/>
          <path d="m76 124-17-3m17 10-16 2m119-10 17-4m-16 12 16 1" fill="none" stroke="#8f867a" strokeWidth="1.5"/>
        </g>
        <g className="pip-scarf"><path d="M85 151c25 12 64 10 85-2l-3 12c-28 12-54 12-80 0Z" fill={`url(#${id}-scarf)`}/><path d="m151 163 6 26 12-7-8-24" fill="#648576"/><path d="m158 177 6-3m-5 8 6-3" fill="none" stroke="#b5b69a" strokeWidth="1.5"/><path d="M124 165v9" fill="none" stroke="#d9b36e" strokeWidth="2"/><path d="m124 173 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#efd08b" stroke="#aa895d" strokeWidth="1.3"/></g>
        <g className="pip-notebook"><path d="m78 181 48 6 38-14-2 36-35 13-48-6Z" fill="#f1dfbb" strokeWidth="2"/><path d="m125 188 2 34m-40-30 28 4m-28 5 26 4m25-12 17-7m-16 15 15-6" fill="none" stroke="#b6a284" strokeWidth="1.4"/><path d="M81 187c-12-7-20 4-13 11l13 2m83-17c9-7 17 2 11 9l-12 5" fill="#eed2ae"/><path d="m157 187 18-26 3 2-17 27" fill="#dca88b" strokeWidth="1.2"/></g>
        <path className="pip-welcome-paw" d="M85 170c-14 1-21-7-19-20 1-8 7-9 11-3l7 8" fill="#f2dcba" strokeWidth="2.5"/>
      </g>
      <g className="pip-little-spark" fill="#f4d385" stroke="#ae966b" strokeWidth=".8"><path d="m211 70 3 10 10 3-10 3-3 10-3-10-10-3 10-3Z"/><path d="m50 139 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/></g>
      <g className="pip-tiny-lantern" stroke="#7a705b" strokeWidth="1.6"><circle cx="216" cy="178" r="32" fill={`url(#${id}-light)`} stroke="none"/><path d="M211 174v-7a5 5 0 0 1 10 0v7" fill="none"/><rect x="207" y="174" width="18" height="26" rx="5" fill="#f2cf86"/><path d="M207 178h18m-18 17h18m-9-17v17"/><path d="m214 186 2-4 3 6-3 4Z" fill="#fff0b7" stroke="none"/></g>
    </svg>
    {note && <figcaption className="pip-note" role="status"><span>Pip whispers</span>{note}</figcaption>}
  </figure>;
}

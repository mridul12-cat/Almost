import { useId } from 'react';
import type { ArtifactType } from '../model/types';
import { artifactDrawing } from '../artwork/artifactDefinitions';
import '../styles/artifacts.css';

type ArtifactProps = {
  type: ArtifactType;
  lightOn?: boolean;
  playing?: boolean;
  revealing?: boolean;
  className?: string;
};

export function Artifact({ type, lightOn = false, playing = false, revealing = false, className = '' }: ArtifactProps) {
  const id = `artifact-${useId().replace(/:/g, '')}`;
  return <div className={`artifact ${lightOn ? 'is-lit' : ''} ${playing ? 'is-playing' : ''} ${revealing ? 'is-revealing' : ''} ${className}`} data-artifact={type}>
    <svg viewBox="0 0 220 220" aria-hidden="true" focusable="false" className="artifact-illustration">
      <defs>
        <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f3e7c7"/><stop offset=".5" stopColor="#e0cfaa"/><stop offset="1" stopColor="#baa681"/></linearGradient>
        <linearGradient id={`${id}-ivory`} x1="0" x2="1"><stop stopColor="#a5afa4"/><stop offset=".42" stopColor="#e4dcc3"/><stop offset=".7" stopColor="#d2ceb8"/><stop offset="1" stopColor="#829893"/></linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8daca7"/><stop offset=".4" stopColor="#426b7b"/><stop offset="1" stopColor="#263c57"/></linearGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c2cc9c"/><stop offset=".5" stopColor="#88a485"/><stop offset="1" stopColor="#4f796d"/></linearGradient>
        <linearGradient id={`${id}-terracotta`} x1="0" x2="1"><stop stopColor="#b27960"/><stop offset=".5" stopColor="#d5a182"/><stop offset="1" stopColor="#9d6553"/></linearGradient>
        <linearGradient id={`${id}-wood`} x1="0" x2="1"><stop stopColor="#795544"/><stop offset=".5" stopColor="#a27b58"/><stop offset="1" stopColor="#624c42"/></linearGradient>
        <radialGradient id={`${id}-halo`}><stop stopColor="#f8d68c" stopOpacity=".43"/><stop offset=".6" stopColor="#f0c474" stopOpacity=".12"/><stop offset="1" stopColor="#f0c474" stopOpacity="0"/></radialGradient>
        <filter id={`${id}-texture`} x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".4" numOctaves="3" seed="9" result="grain"/><feColorMatrix in="grain" type="saturate" values="0" result="paper-grain"/><feComponentTransfer in="paper-grain" result="subtle-grain"><feFuncR type="linear" slope=".25" intercept=".375"/><feFuncG type="linear" slope=".25" intercept=".375"/><feFuncB type="linear" slope=".25" intercept=".375"/></feComponentTransfer><feComposite in="subtle-grain" in2="SourceGraphic" operator="in" result="inside"/><feBlend in="SourceGraphic" in2="inside" mode="soft-light"/></filter>
      </defs>
      <ellipse cx="110" cy="185" rx="58" ry="8" fill="#0b1623" opacity=".25" />
      <circle className="artifact-lasting-halo" cx="110" cy="122" r="98" fill={`url(#${id}-halo)`}/>
      <circle className="artifact-moment-halo" cx="110" cy="122" r="96" fill={`url(#${id}-halo)`}/>
      <g className="artifact-drawing" fill="none" stroke="#574d45" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}-texture)`}>
        {artifactDrawing(type, id)}
      </g>
      <g className="artifact-lasting-light"><ellipse cx="167" cy="185" rx="10" ry="3" fill="#d0a46b" opacity=".3"/><path d="M165 183v-8h4v8" fill="#c6a577" stroke="#82654b" strokeWidth="1"/><circle cx="167" cy="172" r="3.3" fill="#f8d894"/><circle className="artifact-light-aura" cx="167" cy="172" r="12" fill={`url(#${id}-halo)`}/></g>
      <g className="artifact-sparks" fill="#efd59d"><path d="m58 72 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/><path d="m165 100 1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5Z"/><circle cx="151" cy="52" r="1.6"/><circle cx="64" cy="121" r="1.4"/></g>
    </svg>
  </div>;
}

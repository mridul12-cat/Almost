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
        <linearGradient id={`${id}-ivory`} x1="0" x2="1"><stop stopColor="#d3c5b4"/><stop offset=".42" stopColor="#fff0d1"/><stop offset=".7" stopColor="#ead9bc"/><stop offset="1" stopColor="#c4b6a3"/></linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8daca7"/><stop offset=".4" stopColor="#426b7b"/><stop offset="1" stopColor="#263c57"/></linearGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c2cc9c"/><stop offset=".5" stopColor="#88a485"/><stop offset="1" stopColor="#4f796d"/></linearGradient>
        <linearGradient id={`${id}-terracotta`} x1="0" x2="1"><stop stopColor="#8ca79d"/><stop offset=".5" stopColor="#bad0b9"/><stop offset="1" stopColor="#6b928c"/></linearGradient>
        <linearGradient id={`${id}-wood`} x1="0" x2="1"><stop stopColor="#9e7972"/><stop offset=".5" stopColor="#c09b8c"/><stop offset="1" stopColor="#7e686d"/></linearGradient>
        <radialGradient id={`${id}-halo`}><stop stopColor="#f8d68c" stopOpacity=".43"/><stop offset=".6" stopColor="#f0c474" stopOpacity=".12"/><stop offset="1" stopColor="#f0c474" stopOpacity="0"/></radialGradient>
        <filter id={`${id}-texture`} x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".4" numOctaves="3" seed="9" result="grain"/><feColorMatrix in="grain" type="saturate" values="0" result="paper-grain"/><feComponentTransfer in="paper-grain" result="subtle-grain"><feFuncR type="linear" slope=".25" intercept=".375"/><feFuncG type="linear" slope=".25" intercept=".375"/><feFuncB type="linear" slope=".25" intercept=".375"/></feComponentTransfer><feComposite in="subtle-grain" in2="SourceGraphic" operator="in" result="inside"/><feBlend in="SourceGraphic" in2="inside" mode="soft-light"/></filter>
      </defs>
      <ellipse cx="110" cy="185" rx="58" ry="8" fill="#0b1623" opacity=".25" />
      <circle className="artifact-lasting-halo" cx="110" cy="122" r="98" fill={`url(#${id}-halo)`}/>
      <circle className="artifact-moment-halo" cx="110" cy="122" r="96" fill={`url(#${id}-halo)`}/>
      <g className="artifact-drawing" fill="none" stroke="#3d5158" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}-texture)`}>
        {artifactDrawing(type, id)}
      </g>
      <g className="artifact-lasting-light"><circle className="artifact-light-aura" cx="169" cy="166" r="30" fill={`url(#${id}-halo)`}/><path d="M165 161v-4a4 4 0 0 1 8 0v4" fill="none" stroke="#a18a64" strokeWidth="1.5"/><rect x="162" y="160" width="14" height="22" rx="4" fill="#ebc77d" stroke="#8b795b" strokeWidth="1.5"/><path d="M162 164h14m-14 14h14" stroke="#a88b58" strokeWidth="1"/><path d="m169 166 2 5-2 4-2-4Z" fill="#fff5ca"/><ellipse cx="169" cy="184" rx="12" ry="3" fill="#f0c882" opacity=".22"/></g>
      <g className="artifact-sparks" fill="#efd59d"><path d="m58 72 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/><path d="m165 100 1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5Z"/><circle cx="151" cy="52" r="1.6"/><circle cx="64" cy="121" r="1.4"/></g>
    </svg>
  </div>;
}

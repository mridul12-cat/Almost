import { useCallback, useEffect, useRef, useState } from 'react';
import type { PipMood } from '../components/PipCurator';
import { useReducedMotion } from './useReducedMotion';

const aliases: Partial<Record<PipMood, PipMood>> = { idle: 'sleepy', writing: 'listening', placing: 'happy', light: 'looking' };

/** A small, ephemeral character state machine. No museum data or persistence is involved. */
export function usePipBehavior() {
  const reducedMotion = useReducedMotion();
  const reducedRef = useRef(reducedMotion);
  useEffect(() => { reducedRef.current = reducedMotion; }, [reducedMotion]);
  const [state, setState] = useState<{ mood: PipMood; speaking: boolean }>({ mood: 'welcome', speaking: true });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  const react = useCallback((requested: PipMood, speak = false) => {
    clear();
    const mood = aliases[requested] ?? requested;
    const contextual = mood === 'welcome' || mood === 'happy' || mood === 'looking';
    setState({ mood, speaking: contextual && speak });
    const settle = () => {
      if (reducedRef.current) {
        setState({ mood: 'sleepy', speaking: false });
        return;
      }
      setState({ mood: 'settling', speaking: false });
      timers.current.push(setTimeout(() => setState({ mood: 'sleepy', speaking: false }), 700));
    };
    if (contextual) timers.current.push(setTimeout(settle, mood === 'welcome' ? 2200 : 2000));
    else if (mood === 'settling') timers.current.push(setTimeout(() => setState({ mood: 'sleepy', speaking: false }), reducedRef.current ? 0 : 700));
  }, [clear]);
  useEffect(() => {
    react('welcome', true);
    return clear;
  }, [react, clear]);
  return { ...state, react };
}

import type { ScoreState, Telemetry } from './types.js';

const states = new Map<string, ScoreState>();

export function upsertScore(userId: string, scoreDelta: number, t: Telemetry) {
  const prev = states.get(userId) || { userId, score: 85, lastTs: 0, events: 0, last: null };
  const nextScore = clamp(prev.score + scoreDelta, 0, 100);
  const next: ScoreState = { userId, score: nextScore, lastTs: t.ts, events: prev.events + 1, last: null /* no guardamos telemetría cruda */ };
  states.set(userId, next);
  return next;
}

export function getTop(n = 200) {
  return Array.from(states.values()).sort((a,b) => b.score - a.score).slice(0,n);
}

export function toLean(s: ScoreState){ return ({ userId: s.userId, score: s.score, lastTs: s.lastTs, events: s.events }); }

function clamp(x: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, x)); }
import { getAllEvents } from "./events_store";

export function computePercentiles(values: number[]) {
  if (!values.length) return { p10: 0, p50: 0, p90: 0 };
  const arr = [...values].sort((a, b) => a - b);
  const q = (p: number) => {
    const pos = (arr.length - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    return arr[base] + (arr[base + 1] ?? arr[base] ?? 0 - (arr[base] ?? 0)) * rest;
  };
  return { p10: q(0.10), p50: q(0.50), p90: q(0.90) };
}

export function eventsHeatmap(days = 7) {
  // Matriz 7x24: 0=Dom ... 6=Sáb / 0..23 hora
  const mat: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const now = Date.now();
  const from = now - days * 24 * 60 * 60 * 1000;
  for (const e of getAllEvents()) {
    if (e.ts < from) continue;
    const d = new Date(e.ts);
    const dow = d.getDay();
    const hr = d.getHours();
    mat[dow][hr] += 1;
  }
  return mat;
}
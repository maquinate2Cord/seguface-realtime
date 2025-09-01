import { getEventsSince } from "./events_store";

export function qualityMetrics(minutes = 60) {
  const events = getEventsSince(minutes * 60 * 1000);
  const n = events.length || 1;
  const latencies: number[] = [];
  let gpsMissing = 0;

  const seen = new Set<string>();
  let dups = 0;

  for (const e of events) {
    if (e.lat == null || e.lng == null) gpsMissing++;
    latencies.push(Math.max(0, Date.now() - e.ts));
    const key = `${e.userId}|${e.ts}|${e.type}`;
    if (seen.has(key)) dups++;
    else seen.add(key);
  }

  latencies.sort((a, b) => a - b);
  const p = (x: number) => {
    if (!latencies.length) return 0;
    const pos = Math.floor((latencies.length - 1) * x);
    return latencies[pos];
    };
  return {
    windowMinutes: minutes,
    samples: events.length,
    gpsMissingPct: +(100 * gpsMissing / n).toFixed(2),
    duplicatesPct: +(100 * dups / n).toFixed(2),
    latencyMsP50: p(0.5),
    latencyMsP95: p(0.95),
  };
}
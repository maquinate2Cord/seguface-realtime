import type { ScoreState } from "./types";

export type Bucket = { name: "High" | "Medium" | "Low"; count: number };

export function riskBuckets(scores: ScoreState[]): Bucket[] {
  const high = scores.filter((s) => s.score < 60).length;
  const medium = scores.filter((s) => s.score >= 60 && s.score < 80).length;
  const low = scores.filter((s) => s.score >= 80).length;
  return [
    { name: "High", count: high },
    { name: "Medium", count: medium },
    { name: "Low", count: low },
  ];
}

export function topRisk(scores: ScoreState[], n = 10) {
  return scores
    .slice()
    .sort((a, b) => a.score - b.score)
    .slice(0, n)
    .map((s) => ({ userId: s.userId, score: s.score, lastTs: s.lastTs, events: s.events }));
}

export function portfolioAnalytics(scores: ScoreState[]) {
  return {
    buckets: riskBuckets(scores),
    topRisk: topRisk(scores, 10),
  };
}


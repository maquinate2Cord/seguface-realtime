import type { ScoreState } from "./types";

export type PortfolioMetrics = {
  totalDrivers: number;
  activeVehicles: number;
  avgScore: number;
  highRisk: number;
  updatedAt: number;
};

export function computePortfolioMetrics(scores: ScoreState[]): PortfolioMetrics {
  const totalDrivers = scores.length;
  const now = Date.now();
  const activeVehicles = scores.filter((s) => now - s.lastTs <= 5 * 60 * 1000).length;
  const avgScore = totalDrivers ? Math.round((scores.reduce((a, b) => a + b.score, 0) / totalDrivers) * 10) / 10 : 0;
  const highRisk = scores.filter((s) => s.score < 60).length;
  return { totalDrivers, activeVehicles, avgScore, highRisk, updatedAt: now };
}


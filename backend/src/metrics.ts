import type { DriverState } from "./types";
import { getRecentClaims } from "./claims";

export function computeMetrics(all: DriverState[]) {
  const now = Date.now();
  const active = all.filter((r) => now - r.lastTs <= 5 * 60 * 1000);
  const total = all.length;
  const avgScore = total ? all.reduce((a, b) => a + b.score, 0) / total : 0;

  const buckets = { b0_59: 0, b60_74: 0, b75_89: 0, b90_100: 0 };
  for (const r of all) {
    if (r.score < 60) buckets.b0_59++;
    else if (r.score < 75) buckets.b60_74++;
    else if (r.score < 90) buckets.b75_89++;
    else buckets.b90_100++;
  }

  const highRisk = buckets.b0_59;
  const recent = getRecentClaims(30);
  const claimRate = total ? recent.length / total : 0;
  const avgSeverity = recent.length ? recent.reduce((a, b) => a + b.severity, 0) / recent.length : 0;
  const avgCost = recent.length ? recent.reduce((a, b) => a + b.costUsd, 0) / recent.length : 0;
  const expectedLoss = claimRate * (avgSeverity || 1) * (avgCost || 2000);

  return {
    total,
    active: active.length,
    avgScore,
    highRisk,
    buckets,
    claims30d: recent.length,
    claimRate,
    avgSeverity,
    avgCost,
    expectedLoss,
  };
}


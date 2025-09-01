import type { DriverState } from "./types";
import { getRecentClaims } from "./claims";

export type BucketCounts = { b0_59:number; b60_74:number; b75_89:number; b90_100:number };
export type Dist = { name:string; value:number };

export function countBuckets(all: DriverState[]): BucketCounts {
  const b = { b0_59:0, b60_74:0, b75_89:0, b90_100:0 };
  for (const r of all) {
    if (r.score < 60) b.b0_59++;
    else if (r.score < 75) b.b60_74++;
    else if (r.score < 90) b.b75_89++;
    else b.b90_100++;
  }
  return b;
}

function toDist(b: BucketCounts): Dist[] {
  const total = b.b0_59 + b.b60_74 + b.b75_89 + b.b90_100 || 1;
  return [
    { name:"0-59",   value: b.b0_59/total },
    { name:"60-74",  value: b.b60_74/total },
    { name:"75-89",  value: b.b75_89/total },
    { name:"90-100", value: b.b90_100/total },
  ];
}

/** Population Stability Index (PSI) entre dos distribuciones (mismas bins) */
export function psi(baseline: BucketCounts, current: BucketCounts){
  const p = toDist(baseline);
  const q = toDist(current);
  let s = 0;
  for (let i=0;i<p.length;i++){
    const pi = Math.max(1e-6, p[i].value);
    const qi = Math.max(1e-6, q[i].value);
    s += (qi - pi) * Math.log(qi/pi);
  }
  return { psi: s, baseline: p, current: q };
}

/** CalibraciÃ³n (reliability): tasa de siniestro 30d por bucket de score */
export function calibration(all: DriverState[]){
  const buckets = [
    { name:"0-59",   min:0,  max:59.999, n:0, claims:0 },
    { name:"60-74",  min:60, max:74.999, n:0, claims:0 },
    { name:"75-89",  min:75, max:89.999, n:0, claims:0 },
    { name:"90-100", min:90, max:100,    n:0, claims:0 },
  ];
  const recentClaims = getRecentClaims(30);
  const claimSet = new Set(recentClaims.map(c => `${c.userId}`)); // 1+ claim â†’ marcado

  for (const r of all){
    const b = buckets.find(b => r.score >= b.min && r.score <= b.max)!;
    b.n++;
    if (claimSet.has(r.userId)) b.claims++;
  }
  return buckets.map(b => ({
    bucket: b.name,
    size: b.n,
    rate: b.n ? b.claims / b.n : 0
  }));
}


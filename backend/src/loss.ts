import { getAllClaims, getRecentClaims } from "./claims";
import { getTop } from "./store";
import { eventsHeatmap } from "./analytics2";
import { getAllEvents } from "./events_store";

/** Utiles */
function binsByScore(users: { userId: string; score: number }[], bins = 10) {
  const arr = [...users].sort((a, b) => a.score - b.score);
  const out: { from: number; to: number; ids: string[] }[] = [];
  for (let i = 0; i < bins; i++) {
    const a = Math.floor((i * arr.length) / bins);
    const b = Math.floor(((i + 1) * arr.length) / bins) - 1;
    const from = arr[a]?.score ?? 0;
    const to = arr[b]?.score ?? from;
    out.push({ from, to, ids: arr.slice(a, b + 1).map(x => x.userId) });
  }
  return out;
}

function sevToAmount(sev: number) {
  // Montos base por severidad (USD) — ajustables
  const table = { 1: 200, 2: 600, 3: 1500, 4: 5000, 5: 12000 };
  return table[Math.max(1, Math.min(5, Math.round(sev)))] || 1000;
}

/** Lift por decil (claims por 100 usuarios) — fallback a eventos severos si no hay claims */
export function liftByDecile(days = 90, bins = 10) {
  const users = getTop(2000).map(s => ({ userId: s.userId, score: s.score }));
  const buckets = binsByScore(users, bins);
  const claims = getRecentClaims(days);
  const useEvents = !claims.length;
  const severe = getAllEvents().filter(e => {
    const cutoff = Date.now() - days*24*60*60*1000;
    return e.ts >= cutoff && e.severity >= 4;
  });

  return buckets.map((b, i) => {
    const nUsers = b.ids.length || 1;
    let nClaims = 0;
    if (!useEvents) {
      const ids = new Set(b.ids);
      nClaims = claims.filter(c => ids.has(c.userId)).length;
    } else {
      const ids = new Set(b.ids);
      nClaims = severe.filter(e => ids.has(e.userId)).length;
    }
    const ratePer100 = +( (nClaims / nUsers) * 100 ).toFixed(3);
    return { bin: i+1, from: b.from, to: b.to, users: nUsers, count: nClaims, ratePer100 };
  });
}

/** Expected Loss por cohorte (por defecto buckets de riesgo) */
export function expectedLoss(by: "bucket" | "region" = "bucket", days = 30) {
  const scores = getTop(2000).map(s => ({ userId: s.userId, score: s.score }));
  const claims = getRecentClaims(days);
  const useEvents = !claims.length;
  const cutoff = Date.now() - days*24*60*60*1000;
  const events = getAllEvents().filter(e => e.ts >= cutoff);

  function cohortOf(userId: string, score: number) {
    if (by === "bucket") {
      if (score < 60) return "High";
      if (score < 80) return "Medium";
      return "Low";
    } else {
      // region simple por lat/lng más reciente (si no hay, "NA")
      const last = [...events].reverse().find(e => e.userId === userId && e.lat != null && e.lng != null);
      if (!last) return "NA";
      const lat = last.lat as number, lng = last.lng as number;
      if (lat < -30) return "South";
      if (lat > 0) return "North";
      if (lng < -30) return "West";
      return "East";
    }
  }

  const byCohort = new Map<string, { users: Set<string>, claims: number, amt: number, sev: number, sevCount: number }>();
  for (const s of scores) {
    const key = cohortOf(s.userId, s.score);
    if (!byCohort.has(key)) byCohort.set(key, { users: new Set(), claims: 0, amt: 0, sev: 0, sevCount: 0 });
    byCohort.get(key)!.users.add(s.userId);
  }

  if (!useEvents) {
    for (const c of claims) {
      const score = scores.find(s => s.userId === c.userId)?.score ?? 70;
      const key = cohortOf(c.userId, score);
      const bucket = byCohort.get(key);
      if (!bucket) continue;
      bucket.claims += 1;
      if (typeof (c as any).amountUsd === "number") bucket.amt += (c as any).amountUsd;
      if (typeof (c as any).severity === "number") { bucket.sev += (c as any).severity; bucket.sevCount += 1; }
    }
  } else {
    // Proxy: eventos severos (sev >=4)
    for (const e of events) {
      if (e.severity < 4) continue;
      const score = scores.find(s => s.userId === e.userId)?.score ?? 70;
      const key = cohortOf(e.userId, score);
      const bucket = byCohort.get(key);
      if (!bucket) continue;
      bucket.claims += 1;
      bucket.amt += sevToAmount(e.severity);
      bucket.sev += e.severity; bucket.sevCount += 1;
    }
  }

  const out = [];
  for (const [key, v] of byCohort.entries()) {
    const nUsers = Math.max(1, v.users.size);
    const p = v.claims / nUsers; // por usuario
    const meanSev = v.sevCount ? v.sev / v.sevCount : 0;
    const meanAmt = v.claims ? v.amt / v.claims : sevToAmount(meanSev || 3);
    const EL = p * meanAmt * nUsers;
    out.push({
      cohort: key,
      users: nUsers,
      pClaim: +p.toFixed(4),
      meanSeverity: +meanSev.toFixed(2),
      meanAmountUSD: Math.round(meanAmt),
      expectedLossUSD: Math.round(EL)
    });
  }
  return out.sort((a,b)=> a.cohort.localeCompare(b.cohort));
}

/** Claims aging por rangos */
export function claimsAging(days = 90) {
  const list = getRecentClaims(days);
  const now = Date.now();
  const bucket = (d: number) => d<=3? "0-3d" : d<=7? "4-7d" : d<=14? "8-14d" : d<=30? "15-30d" : ">30d";
  const map = new Map<string, number>();
  for (const c of list) {
    const ageDays = Math.floor((now - (c.ts || now))/86400000);
    const k = `${bucket(ageDays)}|${(c as any).status || "unknown"}`;
    map.set(k, (map.get(k) || 0) + 1);
  }
  const out: { range: string; status: string; count: number }[] = [];
  for (const [k,v] of map.entries()) {
    const [range, status] = k.split("|");
    out.push({ range, status, count: v });
  }
  return out.sort((a,b)=> a.range.localeCompare(b.range) || a.status.localeCompare(b.status));
}
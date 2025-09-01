import type { Claim } from "./types";

const claims: Claim[] = [];

function genId() {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).toUpperCase();
}

export function addClaim(c: Omit<Claim, "id" | "ts"> & Partial<Pick<Claim, "ts">>): Claim {
  const claim: Claim = {
    id: genId(),
    ts: c.ts ?? Date.now(),
    userId: c.userId,
    type: c.type ?? "incident",
    severity: c.severity ?? 3,
    amountUsd: c.amountUsd ?? 0,
    status: c.status ?? "open",
    lat: c.lat,
    lng: c.lng,
    description: c.description,
  };
  claims.push(claim);
  if (claims.length > 1000) claims.shift();
  return claim;
}

export function getRecentClaims(days = 30): Claim[] {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return claims.filter((c) => c.ts >= since);
}

export function getAllClaims(): Claim[] {
  return claims.slice();
}


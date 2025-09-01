import type { Claim } from "./types";

const claims: Claim[] = [];

export function addClaim(c: Claim) {
  claims.push(c);
  if (claims.length > 1000) claims.shift();
}

export function getRecentClaims(days = 30): Claim[] {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return claims.filter((c) => c.ts >= since);
}

export function getAllClaims(): Claim[] {
  return claims.slice();
}


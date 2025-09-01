export type RiskEvt = {
  userId: string;
  ts: number;
  type: "overSpeed" | "hardBrake" | "hardAccel";
  lat?: number;
  lng?: number;
  severity: number;
};

const events: RiskEvt[] = [];
const seen = new Set<string>();

export function addRiskEvent(e: RiskEvt) {
  const key = `${e.userId}|${e.ts}|${e.type}`;
  const duplicate = seen.has(key);
  seen.add(key);
  events.push(e);
  if (events.length > 20000) events.shift();
  return { duplicate };
}

export function getEventsSince(msAgo: number): RiskEvt[] {
  const cutoff = Date.now() - msAgo;
  return events.filter((e) => e.ts >= cutoff);
}

export function getAllEvents(): RiskEvt[] {
  return events.slice();
}
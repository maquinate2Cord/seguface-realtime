import type { Telemetry } from "./types";

const TARGET_SCORE = 80;
const MAX_DELTA_UP = 0.6;
const MAX_DELTA_DOWN = -3.0;
const BASE_RECOVERY = 0.18;
const JITTER = 0.15;
const COOL_DOWN_MS = 90_000;

const lastStrongEvent = new Map<string, number>();
const inCooldown = (userId: string) => (Date.now() - (lastStrongEvent.get(userId) ?? 0)) < COOL_DOWN_MS;

export function scoreDelta(t: Telemetry) {
  let delta = BASE_RECOVERY;

  if (inCooldown(t.userId)) delta -= 0.4;

  // Penalizaciones por riesgo
  if (t.speedKph > 150) delta -= 1.2;
  if (t.brake > 0.75 && t.speedKph > 50) delta -= 1.4;
  if (t.accel > 4.6 && t.speedKph > 90) delta -= 0.9;
  if (t.throttle > 90 && t.rpm > 5200 && t.speedKph > 110) delta -= 0.7;

  // Tendencia al objetivo
  const diff = TARGET_SCORE - t.speedKph * 0.02;
  delta += Math.sign(diff) * 0.02;

  // Ruido estocástico
  delta += (Math.random() * 2 - 1) * JITTER;

  // Limitar delta
  if (delta > MAX_DELTA_UP) delta = MAX_DELTA_UP;
  if (delta < MAX_DELTA_DOWN) delta = MAX_DELTA_DOWN;

  return delta;
}

export function detectRisk(t: Telemetry) {
  const out: { userId: string; ts: number; type: "overSpeed" | "hardBrake" | "hardAccel"; lat: number; lng: number; severity: number }[] = [];
  const gate = (p: number) => Math.random() < p;

  if (t.speedKph > 150 && gate(0.55)) {
    const sev = Math.min(5, Math.max(2, Math.round((t.speedKph > 170 ? 3.6 : 3.0) + Math.random() * 0.8)));
    out.push({ userId: t.userId, ts: t.ts, type: "overSpeed", lat: t.lat, lng: t.lng, severity: sev });
  }
  if (t.brake > 0.75 && t.speedKph > 50 && gate(0.5)) {
    const sev = Math.min(5, Math.max(2, Math.round((t.brake > 0.9 ? 3.5 : 2.8) + Math.random() * 0.7)));
    out.push({ userId: t.userId, ts: t.ts, type: "hardBrake", lat: t.lat, lng: t.lng, severity: sev });
  }
  if (t.accel > 4.6 && gate(0.45)) {
    const sev = Math.min(5, Math.max(1, Math.round((t.accel > 5.8 ? 2.8 : 2.3) + Math.random() * 0.7)));
    out.push({ userId: t.userId, ts: t.ts, type: "hardAccel", lat: t.lat, lng: t.lng, severity: sev });
  }

  if (out.some(r => r.severity >= 4)) lastStrongEvent.set(t.userId, Date.now());
  return out;
}



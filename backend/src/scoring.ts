import type { Telemetry } from "./types";

const TARGET_SCORE = 75;     // objetivo de media
const K_PULL = 0.06;         // fuerza de reversión (0.04–0.08 razonable)
const NOISE_STD = 0.35;      // desviación del ruido (0.25–0.45)
const MAX_DELTA_UP = 0.6;    // techo de subida por tick
const MAX_DELTA_DOWN = -3.0; // piso de bajada (penaliza más rápido)
const COOL_DOWN_MS = 90_000; // enfriamiento tras evento fuerte

const lastStrongEvent = new Map<string, number>();
const inCooldown = (userId: string) =>
  Date.now() - (lastStrongEvent.get(userId) ?? 0) < COOL_DOWN_MS;

function gaussian(mean = 0, std = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Ahora recibe el score previo para hacer mean-reversion
export function scoreDelta(prevScore: number, t: Telemetry) {
  // Reversión: si el score está > TARGET, empuja hacia abajo; si < TARGET, hacia arriba
  let delta = K_PULL * (TARGET_SCORE - prevScore);

  // Si venimos de un evento fuerte reciente, frena la recuperación
  if (inCooldown(t.userId)) delta -= 0.25;

  // Penalizaciones por telemetría (ajustables)
  if (t.speedKph > 150) delta -= (t.speedKph - 150) * 0.02;   // hasta ~1.4 a 220
  if (t.brake > 0.85 && t.speedKph > 40) delta -= 1.0;
  if (t.accel > 5.0 && t.speedKph > 70) delta -= 0.8;
  if (t.throttle > 90 && t.rpm > 5000 && t.speedKph > 110) delta -= 0.6;

  // Ruido gaussiano (mantiene variabilidad sin drift sistemático)
  delta += gaussian(0, NOISE_STD);

  // Limitar
  if (delta > MAX_DELTA_UP) delta = MAX_DELTA_UP;
  if (delta < MAX_DELTA_DOWN) delta = MAX_DELTA_DOWN;
  return delta;
}

export function detectRisk(t: Telemetry) {
  const out: {
    userId: string; ts: number;
    type: "overSpeed" | "hardBrake" | "hardAccel";
    lat: number; lng: number; severity: number;
  }[] = [];
  const gate = (p: number) => Math.random() < p;

  // Ajuste de probabilidades para no “inundar” eventos pero que afecten score
  if (t.speedKph > 150 && gate(0.35)) {
    const sev = Math.min(5, 2 + Math.round((t.speedKph - 140) / 25));
    out.push({ userId: t.userId, ts: t.ts, type: "overSpeed", lat: t.lat, lng: t.lng, severity: sev });
  }
  if (t.brake > 0.75 && t.speedKph > 45 && gate(0.30)) {
    const sev = Math.min(5, 2 + Math.round((t.brake - 0.75) * 6));
    out.push({ userId: t.userId, ts: t.ts, type: "hardBrake", lat: t.lat, lng: t.lng, severity: sev });
  }
  if (t.accel > 4.6 && gate(0.25)) {
    const sev = Math.min(5, 1 + Math.round((t.accel - 4.5)));
    out.push({ userId: t.userId, ts: t.ts, type: "hardAccel", lat: t.lat, lng: t.lng, severity: sev });
  }

  if (out.some(e => e.severity >= 4)) lastStrongEvent.set(t.userId, Date.now());
  return out;
}

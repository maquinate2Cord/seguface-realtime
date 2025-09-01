import type { Telemetry } from "./types";

export type SimConfig = {
  targetScore: number;     // media deseada (0..100)
  kPull: number;           // fuerza de reversión a la media (0..1)
  noiseStd: number;        // desvío estándar del ruido gaussiano
  maxDeltaUp: number;      // límite de subida por tick
  maxDeltaDown: number;    // límite de bajada por tick (negativo)
  coolDownMs: number;      // enfriamiento tras evento fuerte
  prob: {                  // probabilidades de eventos
    overSpeed: number;     // 0..1
    hardBrake: number;     // 0..1
    hardAccel: number;     // 0..1
  };
};

const defaultConfig: SimConfig = {
  targetScore: 75,
  kPull: 0.06,
  noiseStd: 0.35,
  maxDeltaUp: 0.6,
  maxDeltaDown: -3.0,
  coolDownMs: 90_000,
  prob: { overSpeed: 0.35, hardBrake: 0.30, hardAccel: 0.25 },
};

export const simConfig: SimConfig = structuredClone
  ? structuredClone(defaultConfig)
  : JSON.parse(JSON.stringify(defaultConfig));

const lastStrongEvent = new Map<string, number>();
const inCooldown = (userId: string) =>
  Date.now() - (lastStrongEvent.get(userId) ?? 0) < simConfig.coolDownMs;

function gaussian(mean = 0, std = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

export function getSimConfig(): SimConfig {
  return JSON.parse(JSON.stringify(simConfig));
}

export function resetSimConfig(): SimConfig {
  Object.assign(simConfig, defaultConfig);
  lastStrongEvent.clear();
  return getSimConfig();
}

export function updateSimConfig(patch: Partial<SimConfig>): SimConfig {
  if (patch.targetScore !== undefined) simConfig.targetScore = clamp(patch.targetScore, 0, 100);
  if (patch.kPull !== undefined) simConfig.kPull = clamp(patch.kPull, 0, 1);
  if (patch.noiseStd !== undefined) simConfig.noiseStd = clamp(patch.noiseStd, 0, 5);
  if (patch.maxDeltaUp !== undefined) simConfig.maxDeltaUp = clamp(patch.maxDeltaUp, 0, 10);
  if (patch.maxDeltaDown !== undefined) simConfig.maxDeltaDown = clamp(patch.maxDeltaDown, -10, 0);
  if (patch.coolDownMs !== undefined) simConfig.coolDownMs = clamp(patch.coolDownMs, 0, 600_000);

  if (patch.prob) {
    const p = patch.prob;
    if (p.overSpeed !== undefined) simConfig.prob.overSpeed = clamp(p.overSpeed, 0, 1);
    if (p.hardBrake !== undefined) simConfig.prob.hardBrake = clamp(p.hardBrake, 0, 1);
    if (p.hardAccel !== undefined) simConfig.prob.hardAccel = clamp(p.hardAccel, 0, 1);
  }
  return getSimConfig();
}

// Ahora recibe el score previo (reversión a la media + ruido + penalizaciones)
export function scoreDelta(prevScore: number, t: Telemetry) {
  let delta = simConfig.kPull * (simConfig.targetScore - prevScore);
  if (inCooldown(t.userId)) delta -= 0.25;

  if (t.speedKph > 150) delta -= (t.speedKph - 150) * 0.02;
  if (t.brake > 0.85 && t.speedKph > 40) delta -= 1.0;
  if (t.accel > 5.0 && t.speedKph > 70) delta -= 0.8;
  if (t.throttle > 90 && t.rpm > 5000 && t.speedKph > 110) delta -= 0.6;

  delta += gaussian(0, simConfig.noiseStd);
  if (delta > simConfig.maxDeltaUp) delta = simConfig.maxDeltaUp;
  if (delta < simConfig.maxDeltaDown) delta = simConfig.maxDeltaDown;
  return delta;
}

export function detectRisk(t: Telemetry) {
  const out: {
    userId: string; ts: number;
    type: "overSpeed" | "hardBrake" | "hardAccel";
    lat: number; lng: number; severity: number;
  }[] = [];
  const gate = (p: number) => Math.random() < p;

  if (t.speedKph > 150 && gate(simConfig.prob.overSpeed)) {
    const sev = Math.min(5, 2 + Math.round((t.speedKph - 140) / 25));
    out.push({ userId: t.userId, ts: t.ts, type: "overSpeed", lat: t.lat, lng: t.lng, severity: sev });
  }
  if (t.brake > 0.75 && t.speedKph > 45 && gate(simConfig.prob.hardBrake)) {
    const sev = Math.min(5, 2 + Math.round((t.brake - 0.75) * 6));
    out.push({ userId: t.userId, ts: t.ts, type: "hardBrake", lat: t.lat, lng: t.lng, severity: sev });
  }
  if (t.accel > 4.6 && gate(simConfig.prob.hardAccel)) {
    const sev = Math.min(5, 1 + Math.round((t.accel - 4.5)));
    out.push({ userId: t.userId, ts: t.ts, type: "hardAccel", lat: t.lat, lng: t.lng, severity: sev });
  }

  if (out.some(e => e.severity >= 4)) lastStrongEvent.set(t.userId, Date.now());
  return out;
}

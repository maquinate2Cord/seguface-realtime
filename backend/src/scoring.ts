import type { Telemetry } from './types.js';

// ---------- parámetros “realistas” ----------
const TARGET_SCORE = 80;           // el score tiende a ~80 cuando no hay riesgo
const MAX_DELTA_UP = 0.6;          // límite de recuperación por tick
const MAX_DELTA_DOWN = -3.0;       // límite de penalización por tick
const BASE_RECOVERY = 0.18;        // recuperación suave si todo normal
const JITTER = 0.15;               // ruido aleatorio para evitar monotonicidad (±)
const COOL_DOWN_MS = 90_000;       // cooldown ~90s tras un evento fuerte

// guarda la última vez que vimos un evento fuerte por usuario (cooldown)
const lastStrongEvent = new Map<string, number>();

// Llama a esto cuando detectes riesgos fuertes en simulator/index para marcar cooldown
export function markStrongEvent(userId: string) {
  lastStrongEvent.set(userId, Date.now());
}

/**
 * Cambia el score de manera suave: penaliza menos, recupera hacia TARGET, añade jitter.
 * Con cooldown, la recuperación cae temporalmente tras eventos fuertes.
 */
export function scoreDelta(t: Telemetry): number {
  const now = Date.now();
  const cooldownActive = (now - (lastStrongEvent.get(t.userId) ?? 0)) < COOL_DOWN_MS;

  // Recuperación hacia el “objetivo” cuando la conducción es normal
  let delta = BASE_RECOVERY * (cooldownActive ? 0.35 : 1);

  // Penalizaciones moderadas
  if (t.speedKph > 170)      delta -= 2.2;
  else if (t.speedKph > 150) delta -= 1.4;
  else if (t.speedKph > 130) delta -= 0.8;

  if (t.brake > 4.6) delta -= (t.brake > 5.8 ? 1.6 : 1.0);
  if (t.accel > 4.6) delta -= (t.accel > 5.8 ? 1.2 : 0.8);

  if (t.throttle > 90 && t.rpm > 5200 && t.speedKph > 110) delta -= 0.7;

  // Jitter estocástico (±)
  delta += (Math.random() * 2 - 1) * JITTER;

  // acotar delta por tick
  if (delta > MAX_DELTA_UP) delta = MAX_DELTA_UP;
  if (delta < MAX_DELTA_DOWN) delta = MAX_DELTA_DOWN;

  return delta;
}

/**
 * Detección de riesgos selectiva + severidad con leve aleatoriedad.
 * Devolvé 0..N eventos para que el mapa y alertas no se saturen.
 */
export function detectRisk(t: Telemetry) {
  const risks: {
    userId: string; ts: number;
    type: 'overSpeed'|'hardBrake'|'hardAccel';
    lat: number; lng: number; severity: number;
  }[] = [];

  // Gate probabilístico para no generar riesgo por cada cruce de umbral
  const gate = (p: number) => Math.random() < p;

  // Sobrevelocidad
  if (t.speedKph > 150 && gate(0.55)) {
    const sev = (t.speedKph > 170 ? 3.6 : 3.0) + Math.random()*0.8; // 3.0–4.4 aprox
    risks.push({ userId: t.userId, ts: t.ts, type: 'overSpeed', lat: t.lat, lng: t.lng, severity: Math.min(5, Math.max(2, Math.round(sev))) });
  }

  // Frenada brusca
  if (t.brake > 4.6 && gate(0.5)) {
    const sev = (t.brake > 5.8 ? 3.6 : 3.0) + Math.random()*0.8;
    risks.push({ userId: t.userId, ts: t.ts, type: 'hardBrake', lat: t.lat, lng: t.lng, severity: Math.min(5, Math.max(2, Math.round(sev))) });
  }

  // Aceleración brusca
  if (t.accel > 4.6 && gate(0.45)) {
    const sev = (t.accel > 5.8 ? 2.8 : 2.3) + Math.random()*0.7;   // menos severo
    risks.push({ userId: t.userId, ts: t.ts, type: 'hardAccel', lat: t.lat, lng: t.lng, severity: Math.min(5, Math.max(1, Math.round(sev))) });
  }

  // si hubo evento fuerte, marcamos cooldown (recupera menos un rato)
  if (risks.some(r => r.severity >= 4)) markStrongEvent(t.userId);

  return risks;
}

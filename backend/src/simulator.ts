import { setInterval } from 'node:timers';
import { upsertScore } from './store.js';
import { scoreDelta, detectRisk } from './scoring.js';
import type { Telemetry } from './types.js';
import { config } from './config.js';
import { bus } from './bus.js';

const users = Array.from({ length: config.simulator.users }, (_, i) => `user_${(i+1).toString().padStart(3,'0')}`);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// Centro del mapa (BA)
const CENTER_LAT = -34.6037;
const CENTER_LNG = -58.3816;
const jitter = (base: number, maxDelta = 0.02) => base + (Math.random() - 0.5) * maxDelta;

setInterval(() => {
  // 10–18 eventos por tick → menos ruido
  const events = 10 + Math.floor(Math.random() * 9);

  for (let i = 0; i < events; i++) {
    const userId = pick(users);

    // Probabilidad de “escenario exigente”
    const demanding = Math.random() < 0.22;

    // velocidad base + ruido
    const baseV = demanding ? 120 + Math.random() * 50 : 55 + Math.random() * 55;
    const speed = baseV + (Math.random() - 0.5) * 5;

    // aceleración/frenada con variabilidad
    const hardA = demanding && Math.random() < 0.28;
    const hardB = demanding && Math.random() < 0.24;
    const accel = hardA ? 4.7 + Math.random() * 1.3 : Math.abs((Math.random() - 0.5) * 1.4);
    const brake = hardB ? 4.7 + Math.random() * 1.3 : Math.max(0, Math.random() * 1.0 - Math.random() * 0.5);

    const t: Telemetry = {
      userId,
      ts: Date.now(),
      speedKph: speed,
      rpm: Math.max(700, Math.min(6800, 900 + speed * 25 + (Math.random() - 0.5) * 700)),
      throttle: Math.max(0, Math.min(100, demanding ? 80 + Math.random() * 18 : 15 + Math.random() * 55)),
      accel,
      brake,
      lat: jitter(CENTER_LAT, 0.03), // dentro del cuadro del mapa
      lng: jitter(CENTER_LNG, 0.03),
    };

    // Score y broadcast
    const state = upsertScore(userId, scoreDelta(t), t);
    const lean = { userId: state.userId, score: state.score, lastTs: state.lastTs, events: state.events };
    JSON.stringify(lean);
    bus.emit('score', lean);

    // Riesgos con gate probabilístico/aleatorio
    const risks = detectRisk(t);
    for (const r of risks) {
      JSON.stringify(r);
      bus.emit('risk', r);
    }
  }
}, config.simulator.emitMs);

console.log(`Simulator ON → ${config.simulator.users} usuarios, ~${config.simulator.emitMs}ms, sensibilidad moderada/estocástica`);

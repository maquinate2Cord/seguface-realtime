import { setInterval } from "node:timers";
import { upsertScore, getState } from "./store";
import { scoreDelta, detectRisk } from "./scoring";
import type { Telemetry } from "./types";
import { config } from "./config";
import { bus } from "./bus";

const users = Array.from({ length: config.simulator.users }, (_, i) => `user_${(i + 1).toString().padStart(3, "0")}`);

const CENTER_LAT = -34.6037;
const CENTER_LNG = -58.3816;
const jitter = (base: number, maxDelta = 0.03) => base + (Math.random() - 0.5) * maxDelta;

setInterval(() => {
  const now = Date.now();
  const batch = Math.max(1, Math.round(users.length * 0.15)); // ~15% por tick

  for (let i = 0; i < batch; i++) {
    const userId = users[Math.floor(Math.random() * users.length)];

    const t: Telemetry = {
      userId,
      ts: now,
      speedKph: Math.max(0, Math.round(140 + Math.random() * 60 - 30)),
      rpm: Math.round(2500 + Math.random() * 3500),
      throttle: Math.round(60 + Math.random() * 40),
      accel: +(Math.random() * 6).toFixed(2) as unknown as number,
      brake: +(Math.random()).toFixed(2) as unknown as number,
      lat: jitter(CENTER_LAT),
      lng: jitter(CENTER_LNG),
    };

    const prev = getState(userId);
    const delta = scoreDelta(prev?.score ?? 85, t);
    const state = upsertScore(userId, delta, t);
    const lean = { userId: state.userId, score: state.score, lastTs: state.lastTs, events: state.events };
    bus.emit("score", lean);

    const risks = detectRisk(t);
    for (const r of risks) bus.emit("risk", r);
  }
}, config.simulator.emitMs);

console.log(`Simulator ON → ${config.simulator.users} usuarios, cada ${config.simulator.emitMs}ms`);

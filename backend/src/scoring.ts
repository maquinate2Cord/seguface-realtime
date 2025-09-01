import { Score } from "./types.js";

export interface Metrics {
  avgScore: number;
  riskEvents: number;
  activeVehicles: number;
  reductionPercent: number;
}

export function computeMetrics(scores: Score[]): Metrics {
  const total = scores.length;
  const avg = total > 0 ? scores.reduce((sum, s) => sum + s.value, 0) / total : 0;

  // Ejemplo: riesgos = scores menores a 30
  const riskEvents = scores.filter(s => s.value < 30).length;

  // Ejemplo: activos = vehículos únicos
  const activeVehicles = new Set(scores.map(s => s.vehicleId)).size;

  // Ejemplo: % reducción (mock simple)
  const reductionPercent = Math.round((1 - riskEvents / (total || 1)) * 100);

  return {
    avgScore: Math.round(avg),
    riskEvents,
    activeVehicles,
    reductionPercent,
  };
}

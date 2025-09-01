import type { RiskEvt } from "./events_store";

type Alert = RiskEvt & { id: string; acked: boolean; createdAt: number };

const alerts: Alert[] = [];

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36).slice(4);
}

export function pushAlert(e: RiskEvt) {
  const a: Alert = { ...e, id: genId(), acked: false, createdAt: Date.now() };
  alerts.push(a);
  if (alerts.length > 5000) alerts.shift();
  return a;
}

export function getRecentAlerts(minutes = 15) {
  const cutoff = Date.now() - minutes * 60 * 1000;
  return alerts.filter((a) => a.createdAt >= cutoff).sort((a, b) => b.createdAt - a.createdAt);
}

export function ackAlert(id: string) {
  const a = alerts.find((x) => x.id === id);
  if (a) a.acked = true;
  return !!a;
}
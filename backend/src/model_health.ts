import { getTop } from "./store";
import { computeDrift, snapshotBaseline } from "./drift";
import { calibrationCurve, brierScore } from "./calibration";

export function modelHealth({ bins=20, days=90, beta=0.25 }: { bins?:number; days?:number; beta?:number }) {
  const values = getTop(5000).map(s=>s.score);
  if (!values.length) return { status: "unknown", psi: 0, ks: 0, brier: 0, mae: 0 };

  const drift = computeDrift(values, bins);
  const cal = calibrationCurve(days, 10, beta);
  const b = brierScore(days, beta);

  // umbrales orientativos
  const psi = drift.psi;         // >0.25 warn, >0.5 alert
  const ks  = drift.ks;          // >0.2 warn/alert (según política)
  const br  = b.brier;           // menor es mejor
  const mae = cal.mae;

  let status: "ok"|"warning"|"alert" = "ok";
  if (psi > 0.5 || ks > 0.3) status = "alert";
  else if (psi > 0.25 || ks > 0.2 || br > 0.09) status = "warning";

  return { status, psi, ks, brier: br, mae, baselineAt: drift.baseline.at };
}

export function resetBaselineNow(bins=20){
  const values = getTop(5000).map(s=>s.score);
  return snapshotBaseline(values, bins);
}
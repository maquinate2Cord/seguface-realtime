"use client";
import React, { useState } from "react";

export default function DriftPanel({
  psi, ks, bins, base, cur, onReset
}: {
  psi: number; ks: number; bins: number[]; base: number[]; cur: number[];
  onReset?: ()=>void;
}) {
  const status = psi > 0.5 || ks > 0.3 ? "alert" : psi > 0.25 || ks > 0.2 ? "warn" : "ok";
  const color = status==="alert" ? "bg-rose-100 border-rose-300" : status==="warn" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200";
  const [busy, setBusy] = useState(false);

  const reset = async ()=> {
    if (!onReset) return;
    setBusy(true);
    try { await onReset(); } finally { setBusy(false); }
  };

  return (
    <div className={`p-4 rounded-xl border ${color}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold">Drift de Score (PSI/KS)</div>
        <button onClick={reset} disabled={busy} className="px-2 py-1 text-sm rounded-md border border-slate-300 bg-white hover:bg-slate-50">
          {busy ? "Reseteando…" : "Reset baseline"}
        </button>
      </div>
      <div className="text-sm mb-3">PSI: <b>{psi.toFixed(3)}</b> · KS: <b>{ks.toFixed(3)}</b></div>
      <div className="space-y-1">
        {base.map((b,i)=>{
          const curv = cur[i] ?? 0;
          const max = Math.max(0.001, Math.max(b, curv));
          const w1 = (b/max)*100, w2 = (curv/max)*100;
          const label = `${bins[i].toFixed(0)}–${bins[i+1].toFixed(0)}`;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-16 text-[11px] text-slate-500">{label}</div>
              <div className="flex-1">
                <div className="h-3 rounded bg-slate-100 relative overflow-hidden mb-0.5">
                  <div className="h-3 bg-slate-300/70" style={{ width: w1+"%" }} title={`baseline ~ ${(b*100).toFixed(2)}%`} />
                </div>
                <div className="h-3 rounded bg-slate-100 relative overflow-hidden">
                  <div className="h-3" style={{ width: w2+"%", background: "linear-gradient(90deg, rgba(59,130,246,0.3), rgba(59,130,246,0.6))" }} title={`actual ~ ${(curv*100).toFixed(2)}%`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
"use client";
import React from "react";

type Item = { from:number; to:number; pHat:number; yRate:number; n:number };

export default function CalibrationChart({ items, mae, brier }: { items: Item[]; mae: number; brier?: number }) {
  const max = Math.max(0.001, ...items.map(i => Math.max(i.pHat, i.yRate)));
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
      <div className="mb-2 font-semibold">Calibración (esperado vs observado)</div>
      <div className="text-sm mb-3">MAE: <b>{mae.toFixed(4)}</b>{typeof brier === "number" ? <> · Brier: <b>{brier.toFixed(4)}</b></> : null}</div>
      <div className="space-y-1">
        {items.map((i, idx)=>{
          const e = (i.pHat/max)*100, o = (i.yRate/max)*100;
          const label = `${i.from.toFixed(0)}–${i.to.toFixed(0)}`;
          return (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-16 text-[11px] text-slate-500">{label}</div>
              <div className="flex-1">
                <div className="h-3 rounded bg-slate-100 mb-0.5">
                  <div className="h-3 bg-emerald-400/60" style={{ width: e+"%" }} title={`Esperado: ${(i.pHat*100).toFixed(2)}%`} />
                </div>
                <div className="h-3 rounded bg-slate-100">
                  <div className="h-3 bg-blue-500/60" style={{ width: o+"%" }} title={`Observado: ${(i.yRate*100).toFixed(2)}%`} />
                </div>
              </div>
              <div className="w-24 text-[11px] text-right text-slate-500">n={i.n}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
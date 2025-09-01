"use client";
import React from "react";

export default function PercentilesBands({ p10, p50, p90 }: { p10: number; p50: number; p90: number }) {
  const clamp = (x:number)=>Math.max(0, Math.min(100, x));
  const a = clamp(p10), m = clamp(p50), b = clamp(p90);
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
      <div className="mb-2 font-semibold">Percentiles de Score (snapshot)</div>
      <div className="h-4 rounded-full bg-slate-100 relative">
        <div className="absolute top-0 bottom-0 rounded-full" style={{ left: a+"%", width: Math.max(1, b-a)+"%", background: "linear-gradient(90deg, rgba(59,130,246,0.25), rgba(59,130,246,0.35))" }} />
        <div className="absolute -top-1 w-[2px] bottom-0 bg-slate-700" style={{ left: m+"%" }} />
      </div>
      <div className="mt-2 text-sm text-slate-600 flex gap-4">
        <span>P10: <strong>{a.toFixed(1)}</strong></span>
        <span>P50: <strong>{m.toFixed(1)}</strong></span>
        <span>P90: <strong>{b.toFixed(1)}</strong></span>
      </div>
    </div>
  );
}
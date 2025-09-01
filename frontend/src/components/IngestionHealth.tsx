"use client";
import React from "react";

export default function IngestionHealth({
  freshnessSec, activePct
}:{ freshnessSec:number; activePct:number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold mb-2">Ingesta / Telemetría</div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-slate-500">Freshness (máx.)</div>
          <div className="text-2xl font-semibold">{Math.round(freshnessSec)}s</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">% activos (5m)</div>
          <div className="text-2xl font-semibold">{(activePct*100).toFixed(0)}%</div>
        </div>
      </div>
      <div className="text-xs text-slate-500 mt-2">Monitorea latencia y cobertura de dispositivos.</div>
    </div>
  );
}
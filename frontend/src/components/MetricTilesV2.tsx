"use client";
import React from "react";

export default function MetricTilesV2({
  total, active, avgScore, highRisk, criticalEvents
}:{
  total:number; active:number; avgScore:number; highRisk:number; criticalEvents:number;
}){
  const Tile = ({label, value}:{label:string; value:string}) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
    </div>
  );
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Tile label="Conductores" value={String(total)} />
      <Tile label="Activos (5m)" value={String(active)} />
      <Tile label="Score promedio" value={avgScore?.toFixed(1) ?? "—"} />
      <Tile label="Riesgo alto (<60)" value={String(highRisk)} />
      <Tile label="Eventos críticos" value={String(criticalEvents)} />
    </div>
  );
}
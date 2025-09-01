"use client";
import React from "react";

export default function StatRibbon({
  total, active, avgScore, highRisk, criticalEvents
}:{
  total:number; active:number; avgScore:number; highRisk:number; criticalEvents:number;
}){
  const Item = ({label, value}:{label:string; value:string}) => (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-3">
      <Item label="Conductores" value={String(total)} />
      <Item label="Activos (5m)" value={String(active)} />
      <Item label="Score prom." value={Number.isFinite(avgScore) ? avgScore.toFixed(1) : "—"} />
      <Item label="Riesgo alto (<60)" value={String(highRisk)} />
      <Item label="Eventos críticos" value={String(criticalEvents)} />
    </div>
  );
}
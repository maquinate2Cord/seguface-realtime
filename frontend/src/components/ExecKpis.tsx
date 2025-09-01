"use client";
import React from "react";

export default function ExecKpis({
  total, active, avgScore, riskRateMin, severe24h
}:{
  total:number; active:number; avgScore:number; riskRateMin:number; severe24h:number;
}) {
  const Item = ({label, value, hint}:{label:string; value:string; hint?:string}) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint ? <div className="text-xs text-slate-400 mt-1">{hint}</div> : null}
    </div>
  );
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <Item label="Conductores" value={String(total)} />
      <Item label="Activos (5m)" value={String(active)} />
      <Item label="Score promedio" value={Number.isFinite(avgScore)?avgScore.toFixed(1):"—"} />
      <Item label="Riesgo/min" value={riskRateMin.toFixed(2)} hint="Eventos/ min (últ. 15m)" />
      <Item label="Severos 24h" value={String(severe24h)} />
    </div>
  );
}
"use client";
import React from "react";

type Buckets = { b0_59:number; b60_74:number; b75_89:number; b90_100:number };
type Metrics = {
  total:number; active:number; avgScore:number; highRisk:number;
  buckets:Buckets; claims30d:number; claimRate:number; avgSeverity:number; avgCost:number; expectedLoss:number;
};

export default function PortfolioCards({ m }: { m: Metrics }){
  const Card = ({ label, value, hint }:{ label:string; value:string|number; hint?:string }) => (
    <div className="card p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
      <Card label="Conductores" value={m.total} />
      <Card label="Activos (5m)" value={m.active} />
      <Card label="Score prom." value={m.avgScore.toFixed(1)} />
      <Card label="Riesgo alto (<60)" value={m.highRisk} />
      <Card label="Siniestros (30d)" value={m.claims30d} hint={`${(m.claimRate*100).toFixed(1)}%`} />
      <Card label="Pérdida esperada" value={`US$ ${Math.round(m.expectedLoss).toLocaleString()}`} hint={`Sev ${m.avgSeverity.toFixed(1)} • Coste prom. US$ ${Math.round(m.avgCost).toLocaleString()}`} />
    </section>
  );
}
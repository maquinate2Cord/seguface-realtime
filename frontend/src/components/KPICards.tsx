'use client';
import React from 'react';

export default function KPICards({
  total, active, avgScore, highRisk, criticalEvents
}:{ total:number; active:number; avgScore:number; highRisk:number; criticalEvents:number }){
  const Card = ({ label, value }:{ label:string; value:string|number }) => (
    <div className="card p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card label="Conductores" value={total} />
      <Card label="Activos (5m)" value={active} />
      <Card label="Score promedio" value={avgScore.toFixed(1)} />
      <Card label="Riesgo alto (<60)" value={highRisk} />
      <Card label="Eventos críticos" value={criticalEvents} />
    </section>
  );
}
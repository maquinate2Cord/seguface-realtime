"use client";
import React from "react";

export default function QualityPanel({
  gpsMissingPct,
  duplicatesPct,
  latencyMsP50,
  latencyMsP95,
  windowMinutes,
  samples
}: {
  gpsMissingPct: number; duplicatesPct: number;
  latencyMsP50: number; latencyMsP95: number;
  windowMinutes: number; samples: number;
}) {
  const Card = ({label, value}:{label:string; value:string|number}) => (
    <div className="p-3 rounded-xl border border-slate-200 bg-white">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-xl font-semibold text-slate-800">{value}</div>
    </div>
  );
  return (
    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-slate-800">
      <div className="mb-2 font-semibold">Calidad de datos (últ. {windowMinutes}m, {samples} eventos)</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card label="% GPS faltante" value={`${gpsMissingPct.toFixed(2)}%`} />
        <Card label="% Duplicados" value={`${duplicatesPct.toFixed(2)}%`} />
        <Card label="Latencia P50" value={`${latencyMsP50} ms`} />
        <Card label="Latencia P95" value={`${latencyMsP95} ms`} />
      </div>
    </div>
  );
}
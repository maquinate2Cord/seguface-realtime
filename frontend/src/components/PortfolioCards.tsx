"use client";
import React from "react";

export default function PortfolioCards({
  exposure, claims, freq, severity, pure, lr
}:{
  exposure: number;  // # conductores (proxy de exposición)
  claims: number;    // # siniestros
  freq: number;      // siniestros / exposición (por conductor)
  severity: number;  // monto medio
  pure: number;      // prima pura (freq * severity)
  lr: number;        // proxy de LR (si no hay primas)
}) {
  const Item = ({label, value, hint}:{label:string; value:string; hint?:string}) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint ? <div className="text-xs text-slate-400 mt-1">{hint}</div> : null}
    </div>
  );
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      <Item label="Exposición" value={exposure.toLocaleString()} hint="Conductores" />
      <Item label="Siniestros" value={claims.toLocaleString()} />
      <Item label="Frecuencia" value={(freq*100).toFixed(2) + " %"} hint="Siniestros / conductor" />
      <Item label="Severidad" value={"$ " + Math.round(severity).toLocaleString()} />
      <Item label="Prima pura" value={"$ " + Math.round(pure).toLocaleString()} hint="freq × severity" />
      <Item label="LR (proxy)" value={(lr*100).toFixed(1) + " %"} hint="Sin primas: se muestra proxy" />
    </div>
  );
}
"use client";
import React from "react";

export default function ModelHealthBadge({ status, psi, ks, brier }: { status: "ok"|"warning"|"alert"|"unknown"; psi:number; ks:number; brier:number }) {
  const map = {
    ok: { cls: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "OK" },
    warning: { cls: "bg-amber-100 text-amber-800 border-amber-300", label: "Warning" },
    alert: { cls: "bg-rose-100 text-rose-800 border-rose-300", label: "Alert" },
    unknown: { cls: "bg-slate-100 text-slate-700 border-slate-300", label: "—" },
  } as const;
  const m = map[status] || map.unknown;
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${m.cls}`}>
      <span className="text-sm font-semibold">Model Health: {m.label}</span>
      <span className="text-xs">PSI {psi.toFixed(3)}</span>
      <span className="text-xs">KS {ks.toFixed(3)}</span>
      <span className="text-xs">Brier {brier.toFixed(4)}</span>
    </div>
  );
}
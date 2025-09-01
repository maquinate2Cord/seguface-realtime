"use client";
import React from "react";

type Item = { bin: number; from: number; to: number; users: number; count: number; ratePer100: number };

export default function LiftDecilesChart({ items }: { items: Item[] }) {
  const max = Math.max(1, ...items.map(i => i.ratePer100));
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
      <div className="mb-2 font-semibold">Lift por decil (claims/100 usuarios)</div>
      <div className="space-y-1">
        {items.map(i => {
          const w = (i.ratePer100 / max) * 100;
          return (
            <div key={i.bin} className="flex items-center gap-2">
              <div className="w-16 text-xs text-slate-500">D{i.bin}</div>
              <div className="flex-1 h-4 rounded bg-slate-100 relative overflow-hidden">
                <div className="h-4" style={{ width: w + "%", background: "linear-gradient(90deg, rgba(34,197,94,0.25), rgba(34,197,94,0.5))" }} />
              </div>
              <div className="w-40 text-xs text-right text-slate-600">{i.ratePer100.toFixed(3)} /100 · {i.users} u</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
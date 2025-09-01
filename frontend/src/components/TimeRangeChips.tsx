"use client";
import React from "react";

export type RangeKey = "15m" | "1h" | "24h";
export default function TimeRangeChips({
  value, onChange
}:{ value: RangeKey; onChange:(v:RangeKey)=>void }) {
  const opts: RangeKey[] = ["15m","1h","24h"];
  return (
    <div className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-1">
      {opts.map(o=>{
        const active = o===value;
        return (
          <button key={o}
            onClick={()=>onChange(o)}
            className={`px-3 py-1.5 rounded-lg text-xs transition ${active?"bg-white shadow-sm text-slate-900":"text-slate-600 hover:bg-white/60"}`}>
            {o}
          </button>
        );
      })}
    </div>
  );
}
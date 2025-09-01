"use client";
import React from "react";

const DAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

export default function EventsHeatmap({ matrix }: { matrix: number[][] }) {
  const max = Math.max(1, ...matrix.flat());
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
      <div className="mb-2 font-semibold">Heatmap de eventos (7×24)</div>
      <div className="grid" style={{ gridTemplateColumns: "60px repeat(24, 1fr)", gap: "2px" }}>
        <div></div>
        {Array.from({length:24}, (_,h)=><div key={h} className="text-[10px] text-center text-slate-500">{h}</div>)}
        {matrix.map((row, d)=>(
          <React.Fragment key={d}>
            <div className="text-[12px] text-right pr-1 text-slate-600">{DAYS[d]}</div>
            {row.map((v,h)=>{
              const a = v/max;
              const bg = `rgba(59,130,246,${0.08 + 0.45*a})`;
              return <div key={h} title={`${DAYS[d]} ${h}:00 — ${v}`} className="h-5 rounded-sm" style={{ backgroundColor: bg }} />;
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
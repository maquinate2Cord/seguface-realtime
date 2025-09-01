"use client";
import React from "react";

type RiskEvt = { userId:string; ts:number; type:"overSpeed"|"hardBrake"|"hardAccel"; severity:number; lat?:number; lng?:number };

export default function EventsFeed({ events }:{ events: RiskEvt[] }) {
  const last = [...events].sort((a,b)=>b.ts-a.ts).slice(0,10);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold mb-2">Eventos recientes</div>
      <div className="space-y-2 max-h-64 overflow-auto">
        {last.map((e,idx)=>(
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${e.severity>=0.8?"bg-black":"bg-gray-400"}`} />
              <span className="font-mono">{e.userId}</span>
              <span className="text-slate-500">· {e.type}</span>
            </div>
            <div className="text-slate-500">{new Date(e.ts).toLocaleTimeString()}</div>
          </div>
        ))}
        {last.length===0 && <div className="text-xs text-slate-500">Sin eventos recientes</div>}
      </div>
    </div>
  );
}
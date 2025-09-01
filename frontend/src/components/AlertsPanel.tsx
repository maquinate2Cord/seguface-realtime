'use client';
import React from 'react';

type RiskEvt = { userId:string; ts:number; type:'overSpeed'|'hardBrake'|'hardAccel'; lat:number; lng:number; severity:number };

export default function AlertsPanel({ events }:{ events: RiskEvt[] }){
  const items = [...events].slice(-10).reverse();
  return (
    <div className="card p-4 h-[28rem] overflow-auto">
      <h3 className="text-lg font-semibold mb-3">Alertas recientes</h3>
      <ul className="space-y-2">
        {items.map((e, idx)=> (
          <li key={idx} className={`p-2 rounded ${e.severity>=4? 'bg-rose-500/10 border border-rose-500/30':'bg-amber-500/10 border border-amber-500/30'}`}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{e.type}</span>
              <span className="text-slate-400">{new Date(e.ts).toLocaleTimeString()}</span>
            </div>
            <div className="text-xs text-slate-300">user: {e.userId} • sev {e.severity} • ({e.lat.toFixed(3)}, {e.lng.toFixed(3)})</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
"use client";
import React from "react";
type Claim = { id:string; userId:string; ts:number; severity:number; costUsd:number; lat:number; lng:number };

export default function ClaimsPanel({ claims }:{ claims: Claim[] }){
  const items = [...claims].slice(-12).reverse();
  return (
    <div className="card p-4 h-[28rem] overflow-auto">
      <h3 className="text-lg font-semibold mb-3">Siniestros recientes</h3>
      <ul className="space-y-2">
        {items.map(c => (
          <li key={c.id} className="p-2 rounded bg-rose-500/10 border border-rose-500/30">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Sev {c.severity} • US$ {Math.round(c.costUsd).toLocaleString()}</span>
              <span className="text-slate-400">{new Date(c.ts).toLocaleTimeString()}</span>
            </div>
            <div className="text-xs text-slate-300">user: {c.userId} • ({c.lat.toFixed(3)}, {c.lng.toFixed(3)})</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
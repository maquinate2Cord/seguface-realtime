"use client";
import React from "react";
type Evt = { userId:string; ts:number; type:string; lat:number; lng:number; severity:number };

export default function DriverEvents({ events }:{ events:Evt[] }){
  return (
    <div className="card p-4 h-80 overflow-auto">
      <h3 className="text-lg font-semibold mb-2">Eventos de riesgo (24h)</h3>
      <table className="min-w-full text-sm">
        <thead className="text-slate-400">
          <tr><th className="text-left py-1 pr-4">Tipo</th><th className="text-right py-1 pr-4">Sev</th><th className="text-right py-1 pr-4">Hora</th><th className="text-right py-1">Pos</th></tr>
        </thead>
        <tbody>
          {events.slice(-100).reverse().map((e,i)=>(
            <tr key={i} className="border-t border-white/10">
              <td className="py-1 pr-4">{e.type}</td>
              <td className="py-1 pr-4 text-right">{e.severity}</td>
              <td className="py-1 pr-4 text-right">{new Date(e.ts).toLocaleTimeString()}</td>
              <td className="py-1 text-right text-xs">{e.lat.toFixed(3)},{e.lng.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
"use client";
import React from "react";
type Claim = { id:string; userId:string; ts:number; severity:number; costUsd:number; lat:number; lng:number };

export default function DriverClaims({ claims }:{ claims:Claim[] }){
  return (
    <div className="card p-4 h-80 overflow-auto">
      <h3 className="text-lg font-semibold mb-2">Siniestros del conductor</h3>
      {claims.length===0 ? <div className="text-sm text-slate-400">Sin siniestros</div> : (
        <table className="min-w-full text-sm">
          <thead className="text-slate-400">
            <tr><th className="text-left py-1 pr-4">ID</th><th className="text-right py-1 pr-4">Sev</th><th className="text-right py-1 pr-4">Costo</th><th className="text-right py-1">Hora</th></tr>
          </thead>
          <tbody>
            {claims.slice(-50).reverse().map((c)=>(
              <tr key={c.id} className="border-t border-white/10">
                <td className="py-1 pr-4 font-mono">{c.id}</td>
                <td className="py-1 pr-4 text-right">{c.severity}</td>
                <td className="py-1 pr-4 text-right">US$ {Math.round(c.costUsd).toLocaleString()}</td>
                <td className="py-1 text-right">{new Date(c.ts).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
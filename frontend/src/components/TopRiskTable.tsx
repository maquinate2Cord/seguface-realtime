"use client";
import React from "react";
import Link from "next/link";

type Row = { userId:string; score:number; events:number; lastTs:number };

export default function TopRiskTable({ rows, limit=10 }:{ rows: Row[]; limit?: number }) {
  const sorted = [...rows].sort((a,b)=>{
    const sa = a.score ?? 0, sb = b.score ?? 0;
    if (sa !== sb) return sa - sb;              // primero peor score
    return (b.events ?? 0) - (a.events ?? 0);   // luego más eventos
  }).slice(0, limit);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold mb-2">Top riesgos (score bajo)</div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 pr-3">Conductor</th>
              <th className="py-2 pr-3">Score</th>
              <th className="py-2 pr-3">Eventos</th>
              <th className="py-2 pr-3">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r=>(
              <tr key={r.userId} className="border-t border-slate-100">
                <td className="py-2 pr-3 font-mono">{r.userId}</td>
                <td className="py-2 pr-3">{(r.score ?? 0).toFixed(1)}</td>
                <td className="py-2 pr-3">{r.events ?? 0}</td>
                <td className="py-2 pr-3">
                  <Link href={`/dashboard/driver/${r.userId}`} className="text-slate-900 underline">Abrir ficha</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
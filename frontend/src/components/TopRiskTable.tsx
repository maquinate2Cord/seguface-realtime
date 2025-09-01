"use client";
import React, { useMemo } from "react";

type Row = { userId:string; score:number; lastTs:number; events:number };

export default function TopRiskTable({ rows, limit=10 }:{ rows: Row[]; limit?: number }){
  const data = useMemo(()=> {
    const sorted = [...rows].sort((a,b)=> a.score - b.score);
    return sorted.slice(0, limit);
  }, [rows, limit]);

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-2">Top {limit} • Conductores de mayor riesgo</h3>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="text-left py-1 pr-4">User</th>
              <th className="text-right py-1 pr-4">Score</th>
              <th className="text-right py-1 pr-4">Eventos</th>
              <th className="text-right py-1">Últ. actividad</th>
            </tr>
          </thead>
          <tbody>
            {data.map(r=>(
              <tr key={r.userId} className="border-t border-white/10">
                <td className="py-1 pr-4 font-mono">{r.userId}</td>
                <td className="py-1 pr-4 text-right">{r.score.toFixed(1)}</td>
                <td className="py-1 pr-4 text-right">{r.events}</td>
                <td className="py-1 text-right">{new Date(r.lastTs).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
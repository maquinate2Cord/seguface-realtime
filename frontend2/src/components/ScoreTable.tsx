'use client';
import React, { useMemo } from 'react';

type Row = { userId: string; score: number; lastTs: number; events: number };

export default function ScoreTable({ rows }: { rows: Row[] }){
  const data = useMemo(()=> rows.slice().sort((a,b)=> b.score - a.score).slice(0,50), [rows]);
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Top conductores por score</h3>
        <span className="text-sm text-slate-400">{data.length} usuarios</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-300">
            <tr className="text-left">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Usuario</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2 pr-4">Eventos</th>
              <th className="py-2 pr-4">Último</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, idx)=> (
              <tr key={r.userId} className="border-t border-white/10">
                <td className="py-2 pr-4 text-slate-400">{idx+1}</td>
                <td className="py-2 pr-4 font-medium">{r.userId}</td>
                <td className="py-2 pr-4"><span className="px-2 py-1 rounded bg-black/40">{r.score.toFixed(1)}</span></td>
                <td className="py-2 pr-4">{r.events}</td>
                <td className="py-2 pr-4 text-slate-400">{new Date(r.lastTs).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
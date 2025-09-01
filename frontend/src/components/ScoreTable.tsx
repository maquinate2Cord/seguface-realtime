'use client';
import React, { useMemo } from 'react';

type Row = { userId: string; score: number; lastTs: number; events: number };
type UserSeries = Record<string, { ts:number; score:number }[]>;
type RiskEvt = { userId:string; ts:number; type:'overSpeed'|'hardBrake'|'hardAccel'; lat:number; lng:number; severity:number };
type LastRiskByUser = Record<string, RiskEvt | undefined>;

export default function ScoreTable({
  rows, seriesByUser, lastRiskByUser
}:{ rows: Row[]; seriesByUser: UserSeries; lastRiskByUser: LastRiskByUser }){
  const data = useMemo(()=> rows.slice().sort((a,b)=> b.score - a.score).slice(0,50), [rows]);

  const avg15m = (userId: string) => {
    const now = Date.now();
    const arr = (seriesByUser[userId] || []).filter(p => now - p.ts <= 15*60*1000);
    if (!arr.length) return 0;
    return arr.reduce((a,b)=> a + b.score, 0)/arr.length;
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Top conductores</h3>
        <span className="text-sm text-slate-400">{data.length} usuarios</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-300">
            <tr className="text-left">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Usuario</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2 pr-4">Prom 15m</th>
              <th className="py-2 pr-4">Eventos</th>
              <th className="py-2 pr-4">Ubicación</th>
              <th className="py-2 pr-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, idx)=> {
              const avg = avg15m(r.userId);
              const risk = r.score < 40 ? 'Muy alto' : r.score < 60 ? 'Alto' : r.score < 75 ? 'Medio' : 'Bajo';
              const lastRisk = lastRiskByUser[r.userId];
              return (
                <tr key={r.userId} className="border-t border-white/10">
                  <td className="py-2 pr-4 text-slate-400">{idx+1}</td>
                  <td className="py-2 pr-4 font-medium">{r.userId}</td>
                  <td className="py-2 pr-4"><span className="px-2 py-1 rounded bg-black/40">{r.score.toFixed(1)}</span></td>
                  <td className="py-2 pr-4">{avg ? avg.toFixed(1) : '-'}</td>
                  <td className="py-2 pr-4">{r.events}</td>
                  <td className="py-2 pr-4 text-slate-400">
                    {lastRisk ? `${lastRisk.lat.toFixed(3)}, ${lastRisk.lng.toFixed(3)}` : '-'}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      risk==='Muy alto' ? 'bg-rose-500/20 text-rose-300' :
                      risk==='Alto'     ? 'bg-amber-500/20 text-amber-300' :
                      risk==='Medio'    ? 'bg-sky-500/20 text-sky-300' :
                                          'bg-emerald-500/20 text-emerald-300'
                    }`}>{risk}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'use client';
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

type SeriesByUser = Record<string, { ts:number; score:number }[]>;

function colorFor(id: string){
  let h = 0; for (let i=0;i<id.length;i++){ h = (h*31 + id.charCodeAt(i)) % 360; }
  return `hsl(${h} 70% 55%)`;
}

export default function MultiUserChart({ seriesByUser, limit }: { seriesByUser: SeriesByUser; limit: number }){
  const users = useMemo(() => {
    const entries = Object.entries(seriesByUser);
    entries.sort((a,b)=> (b[1].length - a[1].length));
    return entries.slice(0, Math.max(1, limit)).map(([u])=>u).sort();
  }, [seriesByUser, limit]);

  const data = useMemo(() => {
    const allTs = Array.from(new Set(users.flatMap(u => seriesByUser[u].map(p=>p.ts)))).sort((a,b)=>a-b).slice(-200);
    return allTs.map(ts => {
      const obj: any = { ts };
      for (const u of users){
        const p = seriesByUser[u].find(x => x.ts === ts);
        if (p) obj[u] = p.score;
      }
      return obj;
    });
  }, [users, seriesByUser]);

  return (
    <div className="card p-4 h-[28rem]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Scores por usuario (tiempo real)</h3>
        <span className="text-xs text-slate-400">{users.length} usuarios</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="ts" tickFormatter={(t)=> new Date(t).toLocaleTimeString()} stroke="#94a3b8"/>
          <YAxis domain={[0,100]} stroke="#94a3b8"/>
          <Tooltip labelFormatter={(t)=> new Date(Number(t)).toLocaleTimeString()} />
          <Legend />
          {users.map(u => (
            <Line key={u} type="monotone" dataKey={u} dot={false} stroke={colorFor(u)} strokeWidth={1.5} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
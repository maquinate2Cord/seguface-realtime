'use client';
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function HistogramScores({ scores }:{ scores:number[] }){
  const data = useMemo(()=>{
    const bins = [0,50,60,70,80,90,100];
    const counts = Array(bins.length - 1).fill(0);
    for (const s of scores){
      for (let i=0;i<bins.length-1;i++){
        if (s >= bins[i] && s < bins[i+1]) { counts[i]++; break; }
      }
    }
    return counts.map((c,i)=> ({ range: `${bins[i]}-${bins[i+1]-1}`, count: c }));
  },[scores]);

  return (
    <div className="card p-4 h-80">
      <h3 className="text-lg font-semibold mb-2">Distribución de scores</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="range" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
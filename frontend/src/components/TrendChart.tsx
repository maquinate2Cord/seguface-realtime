'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TrendChart({ series }:{ series: { ts:number; avg:number }[] }){
  return (
    <div className="card p-4 h-80">
      <h3 className="text-lg font-semibold mb-2">Tendencia score promedio</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="ts" tickFormatter={(t)=> new Date(t).toLocaleTimeString()} stroke="#94a3b8"/>
          <YAxis domain={[0,100]} stroke="#94a3b8"/>
          <Tooltip labelFormatter={(t)=> new Date(Number(t)).toLocaleTimeString()} />
          <Line type="monotone" dataKey="avg" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
type Pt = { ts:number; score:number };

export default function DriverTrend({ data }:{ data: Pt[] }){
  return (
    <div className="card p-4 h-80">
      <h3 className="text-lg font-semibold mb-2">Tendencia de score</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top:10, right:10, left:0, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="ts" stroke="#94a3b8" tickFormatter={(v)=> new Date(v).toLocaleTimeString()} />
          <YAxis stroke="#94a3b8" domain={[0,100]} />
          <Tooltip labelFormatter={(v)=> new Date(v).toLocaleTimeString()} />
          <Line type="monotone" dataKey="score" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
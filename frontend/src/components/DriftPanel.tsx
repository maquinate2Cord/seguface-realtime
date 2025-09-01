"use client";
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

type Dist = { name:string; value:number };
export default function DriftPanel({ baseline, current, psi }:{ baseline:Dist[]; current:Dist[]; psi:number }){
  const data = useMemo(()=> baseline.map((b,i)=>({ bucket:b.name, baseline:b.value, current: current[i]?.value ?? 0 })), [baseline, current]);
  const color = psi < 0.1 ? "text-green-400" : psi < 0.25 ? "text-yellow-400" : "text-rose-400";
  return (
    <div className="card p-4 h-80">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Drift de distribución (PSI)</h3>
        <span className={`text-sm font-mono ${color}`}>PSI {psi.toFixed(3)}</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top:10, right:10, left:0, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="bucket" stroke="#94a3b8"/>
          <YAxis stroke="#94a3b8" tickFormatter={(v)=> (v*100).toFixed(0)+"%"} />
          <Tooltip formatter={(v)=> (typeof v==='number'?(v*100).toFixed(1)+'%':v)} />
          <Legend />
          <Bar dataKey="baseline" />
          <Bar dataKey="current" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
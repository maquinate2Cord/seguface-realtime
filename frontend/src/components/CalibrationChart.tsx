"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Item = { bucket:string; size:number; rate:number };

export default function CalibrationChart({ data }:{ data: Item[] }){
  return (
    <div className="card p-4 h-80">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Calibración (tasa de siniestro por bucket)</h3>
        <span className="text-xs text-slate-400">últimos 30 días</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top:10, right:10, left:0, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="bucket" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" tickFormatter={(v)=> (v*100).toFixed(1)+"%"} />
          <Tooltip formatter={(v)=> Array.isArray(v)?v[0]:(typeof v==='number'?(v*100).toFixed(2)+'%':v)} />
          <Line type="monotone" dataKey="rate" dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
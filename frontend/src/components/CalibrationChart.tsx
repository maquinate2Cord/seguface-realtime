"use client";
import React from "react";

type Point = { x:number; pred:number; obs:number; label:string };

export default function CalibrationChart({ data }:{ data: Point[] }) {
  // gráfico simple SVG (pred vs obs)
  const w = 520, h = 240, pad = 28;
  const xs = (x:number)=> pad + x*(w-2*pad);
  const ys = (y:number)=> h - pad - y*(h-2*pad);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold mb-2">Calibración (predicho vs observado)</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-60">
        <rect x="0" y="0" width={w} height={h} fill="white" />
        {/* Línea ideal */}
        <line x1={xs(0)} y1={ys(0)} x2={xs(1)} y2={ys(1)} stroke="black" strokeWidth="1" />
        {/* Predicho */}
        <polyline
          fill="none" stroke="black" strokeWidth="2"
          points={data.map(p=>`${xs(p.x)},${ys(p.pred)}`).join(" ")} />
        {/* Observado */}
        <polyline
          fill="none" stroke="gray" strokeWidth="2"
          points={data.map(p=>`${xs(p.x)},${ys(p.obs)}`).join(" ")} />
        {data.map((p,i)=>(
          <g key={i}>
            <circle cx={xs(p.x)} cy={ys(p.obs)} r="3" fill="gray" />
            <text x={xs(p.x)} y={ys(0)-4} fontSize="9" textAnchor="middle">{p.label}</text>
          </g>
        ))}
      </svg>
      <div className="text-xs text-slate-500">Negro: predicho | Gris: observado</div>
    </div>
  );
}
"use client";
import React from "react";

export default function SimpleBars({ values, labels }:{ values:number[]; labels?:string[] }) {
  const w=380, h=160, pad=20, bw=20, gap=14;
  const max = Math.max(1, ...values);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      {values.map((v,i)=>{
        const x = pad + i*(bw+gap);
        const barH = (v/max)*(h-2*pad);
        const y = (h-pad) - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={barH} fill="black" rx="4" />
            {labels?.[i] ? <text x={x+bw/2} y={h-4} textAnchor="middle" className="fill-gray-500" style={{fontSize:"9px"}}>{labels[i]}</text> : null}
          </g>
        );
      })}
    </svg>
  );
}
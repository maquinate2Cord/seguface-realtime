"use client";
import React from "react";

export default function SimpleLine({ points }:{ points:number[] }) {
  const w=380, h=160, pad=16;
  const max = Math.max(1, ...points), min = Math.min(...points, 0);
  const scale = (v:number)=> (h-pad) - ( (v-min)/(max-min||1) )*(h-2*pad);
  const step = (w-2*pad)/Math.max(1, points.length-1);
  const pts = points.map((v,i)=>`${pad+i*step},${scale(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      <polyline points={pts} fill="none" stroke="black" strokeWidth="2"/>
      {points.map((v,i)=>(
        <circle key={i} cx={pad+i*step} cy={scale(v)} r="2.5" fill="black" />
      ))}
    </svg>
  );
}
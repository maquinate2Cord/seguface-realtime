"use client";
import React from "react";

export default function RiskRateSpark({ points }:{ points:number[] }) {
  const w=320, h=64, pad=4;
  const max = Math.max(1, ...points);
  const step = (w - 2*pad) / Math.max(1, points.length-1);
  const pts = points.map((v,i)=>{
    const x = pad + i*step;
    const y = h - pad - (v/max)*(h-2*pad);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16">
      <polyline fill="none" stroke="black" strokeWidth="2" points={pts} />
    </svg>
  );
}
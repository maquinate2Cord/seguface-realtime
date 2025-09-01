"use client";
import React from "react";

export default function GaugeSemi({ value, min=0, max=100, label }:{
  value:number; min?:number; max?:number; label?:string;
}) {
  const v = Math.max(min, Math.min(max, value));
  const pct = (v-min)/(max-min);
  const cx=140, cy=120, r=100;      // centro y radio
  const start = Math.PI, end = 0;   // semicirculo 180º
  const angle = start + pct*(end-start);
  const x = cx + r*Math.cos(angle), y = cy + r*Math.sin(angle);

  const arc = (s:number,e:number)=> {
    const xs = cx + r*Math.cos(s), ys = cy + r*Math.sin(s);
    const xe = cx + r*Math.cos(e), ye = cy + r*Math.sin(e);
    return `M ${xs} ${ys} A ${r} ${r} 0 0 1 ${xe} ${ye}`;
  };

  return (
    <svg viewBox="0 0 280 160" className="w-full h-36">
      <path d={arc(start, end)} stroke="#e5e7eb" strokeWidth="14" fill="none"/>
      <path d={arc(start, angle)} stroke="black" strokeWidth="14" fill="none" />
      <circle cx={x} cy={y} r="6" fill="black" />
      <text x="140" y="82" textAnchor="middle" className="fill-black" style={{fontSize:"22px", fontWeight:700}}>
        {v.toFixed(1)}
      </text>
      <text x="140" y="100" textAnchor="middle" className="fill-gray-500" style={{fontSize:"10px"}}>{label}</text>
      <text x="26" y="140" className="fill-gray-400" style={{fontSize:"10px"}}>{min}</text>
      <text x="250" y="140" className="fill-gray-400" style={{fontSize:"10px"}}>{max}</text>
    </svg>
  );
}
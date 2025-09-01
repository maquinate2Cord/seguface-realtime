"use client";
import React from "react";

export default function DonutKPI({ value, label }:{ value:number; label:string }) {
  const pct = Math.max(0, Math.min(1, value));
  const R=56, C=2*Math.PI*R, stroke=10;
  const dash = `${pct*C} ${C}`;
  return (
    <div className="flex items-center justify-center">
      <svg viewBox="0 0 140 140" className="w-40 h-40">
        <circle cx="70" cy="70" r={R} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <circle cx="70" cy="70" r={R} stroke="black" strokeWidth={stroke} fill="none"
                strokeDasharray={dash} strokeLinecap="round"
                transform="rotate(-90 70 70)" />
        <text x="70" y="68" textAnchor="middle" className="fill-black" style={{fontSize: "20px", fontWeight: 700}}>
          {(pct*100).toFixed(0)}%
        </text>
        <text x="70" y="88" textAnchor="middle" className="fill-gray-500" style={{fontSize:"10px"}}>{label}</text>
      </svg>
    </div>
  );
}
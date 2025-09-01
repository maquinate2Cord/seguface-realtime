"use client";
import React from "react";

type Top = { reason:string; count:number };
export default function ReasonCodesPanel({ top }:{ top: Top[] }){
  return (
    <div className="card p-4 h-80 overflow-auto">
      <h3 className="text-lg font-semibold mb-2">Razones más frecuentes (últ. 60 min)</h3>
      <ul className="space-y-1">
        {top.map((r)=>(
          <li key={r.reason} className="flex justify-between border-b border-white/10 py-1">
            <span>{r.reason}</span>
            <span className="font-mono">{r.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
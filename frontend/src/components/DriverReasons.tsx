"use client";
import React from "react";
type R = { userId:string; reason:string; ts:number };

export default function DriverReasons({ reasons }:{ reasons:R[] }){
  return (
    <div className="card p-4 h-80 overflow-auto">
      <h3 className="text-lg font-semibold mb-2">Razones recientes</h3>
      <ul className="space-y-1">
        {[...reasons].reverse().map((x,i)=>(
          <li key={i} className="flex justify-between border-b border-white/10 py-1 text-sm">
            <span>{x.reason}</span><span className="text-slate-400">{new Date(x.ts).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
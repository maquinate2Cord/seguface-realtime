"use client";
import React from "react";

type Bucket = { name:string; count:number; freq:number; severity:number; avgScore:number };

export default function RiskBucketsChart({ buckets }:{ buckets: Bucket[] }) {
  const maxFreq = Math.max(0, ...buckets.map(b=>b.freq));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold mb-2">Buckets de riesgo</div>
      <div className="grid grid-cols-5 gap-4 items-end h-56">
        {buckets.map((b,idx)=>{
          const h = maxFreq>0 ? Math.max(2, Math.round((b.freq/maxFreq)*100)) : 2;
          return (
            <div key={idx} className="flex flex-col items-center">
              <div className="h-full w-10 flex items-end">
                <div className="w-full rounded-t-md bg-slate-900" style={{height:`${h}%`}} />
              </div>
              <div className="mt-2 text-xs font-medium">{b.name}</div>
              <div className="text-[11px] text-slate-500">{b.count} users</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-slate-500">
        Altura = frecuencia relativa (siniestros / conductor) por bucket. Click en un bucket en la tabla para drill-down (pendiente).
      </div>
    </div>
  );
}
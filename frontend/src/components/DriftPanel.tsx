"use client";
import React from "react";

export default function DriftPanel({
  base, curr, labels
}:{ base:number[]; curr:number[]; labels:string[] }) {
  const sum = (a:number[]) => a.reduce((s,v)=>s+v,0);
  const sb = Math.max(1e-9, sum(base));
  const sc = Math.max(1e-9, sum(curr));
  const rows = labels.map((lab,i)=>{
    const pb = base[i]/sb, pc = curr[i]/sc;
    const contrib = (pc - pb) * Math.log((pc + 1e-12)/(pb + 1e-12));
    return { label: lab, pb, pc, contrib };
  });
  const psi = rows.reduce((s,r)=>s+r.contrib,0);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold mb-2">Drift (PSI)</div>
      <table className="w-full text-sm">
        <thead className="text-left text-slate-500">
          <tr>
            <th className="py-2">Bucket</th>
            <th className="py-2">Base %</th>
            <th className="py-2">Actual %</th>
            <th className="py-2">Contrib.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} className="border-t border-slate-100">
              <td className="py-1">{r.label}</td>
              <td className="py-1">{(r.pb*100).toFixed(2)}%</td>
              <td className="py-1">{(r.pc*100).toFixed(2)}%</td>
              <td className="py-1">{r.contrib.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-slate-200">
          <tr>
            <td className="py-2 font-semibold" colSpan={3}>PSI total</td>
            <td className="py-2 font-semibold">{psi.toFixed(4)}</td>
          </tr>
        </tfoot>
      </table>
      <div className="text-xs text-slate-500 mt-2">Guía: &lt;0.1 estable · 0.1–0.25 leve · &gt;0.25 relevante</div>
    </div>
  );
}
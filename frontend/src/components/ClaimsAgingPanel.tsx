"use client";
import React from "react";

type Row = { range: string; status: string; count: number };

export default function ClaimsAgingPanel({ rows }: { rows: Row[] }) {
  const groups: Record<string, Row[]> = {};
  for (const r of rows) { (groups[r.range] ||= []).push(r); }
  const ranges = Object.keys(groups).sort();
  const statuses = Array.from(new Set(rows.map(r => r.status))).sort();

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
      <div className="mb-2 font-semibold">Claims Aging (count)</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2 pr-4">Rango</th>
              {statuses.map(s=><th key={s} className="py-2 pr-4">{s}</th>)}
              <th className="py-2 pr-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {ranges.map(r=>{
              const arr = groups[r];
              const rowMap: Record<string, number> = {};
              let total = 0;
              for (const x of arr) { rowMap[x.status] = x.count; total += x.count; }
              return (
                <tr key={r} className="border-t border-slate-200">
                  <td className="py-2 pr-4">{r}</td>
                  {statuses.map(s=><td key={s} className="py-2 pr-4">{rowMap[s] || 0}</td>)}
                  <td className="py-2 pr-4 font-semibold">{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
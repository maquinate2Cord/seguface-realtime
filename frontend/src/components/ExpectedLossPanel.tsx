"use client";
import React from "react";

type Row = { cohort: string; users: number; pClaim: number; meanSeverity: number; meanAmountUSD: number; expectedLossUSD: number };

export default function ExpectedLossPanel({ rows, title = "Expected Loss por cohorte" }: { rows: Row[]; title?: string }) {
  const total = rows.reduce((a,b)=>a+b.expectedLossUSD,0);
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
      <div className="mb-2 font-semibold">{title}</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2 pr-4">Cohorte</th>
              <th className="py-2 pr-4">Usuarios</th>
              <th className="py-2 pr-4">p(Claim)</th>
              <th className="py-2 pr-4">Sev media</th>
              <th className="py-2 pr-4">Monto medio</th>
              <th className="py-2 pr-4">Expected Loss</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.cohort} className="border-t border-slate-200">
                <td className="py-2 pr-4">{r.cohort}</td>
                <td className="py-2 pr-4">{r.users}</td>
                <td className="py-2 pr-4">{r.pClaim.toFixed(4)}</td>
                <td className="py-2 pr-4">{r.meanSeverity.toFixed(2)}</td>
                <td className="py-2 pr-4">${r.meanAmountUSD.toLocaleString()}</td>
                <td className="py-2 pr-4 font-semibold">${r.expectedLossUSD.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="border-t-2">
              <td className="py-2 pr-4 font-semibold" colSpan={5}>Total</td>
              <td className="py-2 pr-4 font-semibold">${total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
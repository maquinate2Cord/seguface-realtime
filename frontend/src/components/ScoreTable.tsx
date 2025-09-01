"use client";
import React from "react";
import Link from "next/link";

type Row = { userId: string; score: number; lastTs: number; events: number };
type RiskEvt = { userId: string; ts: number; type: "overSpeed" | "hardBrake" | "hardAccel"; lat: number; lng: number; severity: number };
type SeriesMap = Record<string, { ts: number; score: number }[]>;

export default function ScoreTable({
  rows,
  seriesByUser,
  lastRiskByUser,
}: {
  rows: Row[];
  seriesByUser: SeriesMap;
  lastRiskByUser: Record<string, RiskEvt | undefined>;
}) {
  const now = Date.now();
  const rel = (ts: number) => {
    const d = Math.max(0, now - ts);
    const m = Math.floor(d / 60000);
    if (m < 1) return "ahora";
    if (m < 60) return m + " min";
    const h = Math.floor(m / 60);
    return h + " h";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="py-2 pr-4">Conductor</th>
            <th className="py-2 pr-4">Score</th>
            <th className="py-2 pr-4">Eventos</th>
            <th className="py-2 pr-4">Último</th>
            <th className="py-2 pr-4">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const last = lastRiskByUser[r.userId];
            const hiRisk = r.score < 60;
            return (
              <tr key={r.userId} className={`border-t border-slate-200 hover:bg-slate-50 ${hiRisk ? "bg-red-50/40" : ""}`}>
                <td className="py-2 pr-4 font-mono">
                  <Link href={`/dashboard/driver/${encodeURIComponent(r.userId)}`} className="text-blue-600 hover:underline">
                    {r.userId}
                  </Link>
                </td>
                <td className="py-2 pr-4">{r.score.toFixed(1)}</td>
                <td className="py-2 pr-4">{r.events}</td>
                <td className="py-2 pr-4">
                  <div>{rel(r.lastTs)}</div>
                  {last && <div className="text-[10px] text-slate-500">últ. evt: {last.type} (sev {last.severity})</div>}
                </td>
                <td className="py-2 pr-4">
                  <Link
                    href={`/dashboard/driver/${encodeURIComponent(r.userId)}`}
                    className="inline-block px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100"
                  >
                    Ver detalle →
                  </Link>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-400">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";

type Row = { userId: string; score: number; lastTs: number; events: number };

export default function DriverList({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [sort, setSort] = useState<"scoreAsc"|"scoreDesc"|"eventsDesc">("scoreAsc");
  const now = Date.now();

  const data = useMemo(() => {
    let list = rows;
    if (onlyActive) list = list.filter(r => now - r.lastTs <= 5*60*1000);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(r => r.userId.toLowerCase().includes(needle));
    }
    switch (sort) {
      case "scoreAsc":  list = [...list].sort((a,b)=>a.score-b.score); break;
      case "scoreDesc": list = [...list].sort((a,b)=>b.score-a.score); break;
      case "eventsDesc":list = [...list].sort((a,b)=>b.events-a.events); break;
    }
    return list.slice(0,500);
  }, [rows, q, onlyActive, sort, now]);

  const rel = (ts:number) => {
    const d = Math.max(0, now - ts);
    const m = Math.floor(d/60000);
    if (m < 1) return "ahora";
    if (m < 60) return m+" min";
    const h = Math.floor(m/60);
    return h+" h";
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por ID..."
          className="px-3 py-2 rounded-lg border border-slate-300"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyActive} onChange={e=>setOnlyActive(e.target.checked)} />
          Solo activos (5m)
        </label>
        <select value={sort} onChange={e=>setSort(e.target.value as any)} className="px-3 py-2 rounded-lg border border-slate-300">
          <option value="scoreAsc">Score ↑</option>
          <option value="scoreDesc">Score ↓</option>
          <option value="eventsDesc">Eventos ↓</option>
        </select>
        <div className="text-xs text-slate-500 ml-auto">{data.length} resultados</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2 pr-4">Conductor</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2 pr-4">Eventos</th>
              <th className="py-2 pr-4">Último</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {data.map(r=>(
              <tr key={r.userId} className="border-t border-slate-200 hover:bg-slate-50">
                <td className="py-2 pr-4 font-mono">{r.userId}</td>
                <td className="py-2 pr-4">{r.score.toFixed(1)}</td>
                <td className="py-2 pr-4">{r.events}</td>
                <td className="py-2 pr-4">{rel(r.lastTs)}</td>
                <td className="py-2 pr-4">
                  <Link href={`/dashboard/driver/${encodeURIComponent(r.userId)}`} className="text-blue-600 hover:underline">Ver detalle</Link>
                </td>
              </tr>
            ))}
            {data.length===0 && (
              <tr><td colSpan={5} className="py-8 text-center text-slate-400">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

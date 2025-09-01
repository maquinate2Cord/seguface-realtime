"use client";
import React from "react";
import { Search, Download, Activity, ArrowDownZA, ArrowUpZA, AlertTriangle } from "lucide-react";

export default function FilterBarPro({
  q, onQ, onlyActive, onOnlyActive, minScore, onMinScore, sort, onSort, onExport
}: {
  q: string; onQ: (v:string)=>void;
  onlyActive: boolean; onOnlyActive: (v:boolean)=>void;
  minScore: number; onMinScore: (v:number)=>void;
  sort: "scoreAsc"|"scoreDesc"|"eventsDesc"; onSort: (v:"scoreAsc"|"scoreDesc"|"eventsDesc")=>void;
  onExport: ()=>void;
}) {
  return (
    <section className="p-4 rounded-2xl border border-slate-200 bg-white text-slate-800">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e)=>onQ(e.target.value)}
            placeholder="Buscar conductor (user_001)…"
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 w-64 bg-white"
          />
        </div>

        {/* Solo activos */}
        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 cursor-pointer select-none">
          <Activity className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-700">Solo activos (5m)</span>
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e)=>onOnlyActive(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
        </label>

        {/* Score mínimo */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50">
          <span className="text-xs text-slate-500">Score ≥ {minScore}</span>
          <input
            type="range" min={0} max={100} step={1} value={minScore}
            onChange={(e)=>onMinScore(Number(e.target.value))}
          />
        </div>

        {/* Orden */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50">
          <span className="text-xs text-slate-500">Orden</span>
          <select
            value={sort}
            onChange={(e)=>onSort(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
          >
            <option value="scoreAsc">Score ↑</option>
            <option value="scoreDesc">Score ↓</option>
            <option value="eventsDesc">Eventos</option>
          </select>
          {/* Solo iconos de referencia visual */}
          {sort==="scoreAsc" && <ArrowUpZA className="w-4 h-4 text-slate-400" />}
          {sort==="scoreDesc" && <ArrowDownZA className="w-4 h-4 text-slate-400" />}
          {sort==="eventsDesc" && <AlertTriangle className="w-4 h-4 text-slate-400" />}
        </div>

        {/* Export */}
        <div className="ml-auto">
          <button
            onClick={onExport}
            className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm bg-white"
          >
            <Download className="inline w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>
    </section>
  );
}
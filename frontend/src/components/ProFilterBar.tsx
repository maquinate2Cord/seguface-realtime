"use client";
import React from "react";
import Segmented from "@/components/Segmented";
import { Search, Download, Activity, ArrowUpAZ, ArrowDownAZ, AlertTriangle } from "lucide-react";

export default function ProFilterBar({
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
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        {/* Toggle activos */}
        <button
          onClick={()=>onOnlyActive(!onlyActive)}
          className={`px-3 py-2 rounded-lg border text-sm transition
            ${onlyActive ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-300 text-slate-600 hover:bg-white/70"}`}
          title="Solo activos (últimos 5 min)"
        >
          <Activity className="inline w-4 h-4 mr-2" />
          {onlyActive ? "Solo Activos" : "Todos"}
        </button>

        {/* Slider score mínimo */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Score ≥ {minScore}</span>
          <input
            type="range" min={0} max={100} step={1}
            value={minScore}
            onChange={(e)=>onMinScore(Number(e.target.value))}
          />
        </div>

        {/* Orden */}
        <Segmented
          className="ml-1"
          value={sort}
          onChange={(v)=>onSort(v as any)}
          options={[
            { value: "scoreAsc",  label: "Score ↑",  icon: <ArrowUpAZ className="w-4 h-4" /> },
            { value: "scoreDesc", label: "Score ↓",  icon: <ArrowDownAZ className="w-4 h-4" /> },
            { value: "eventsDesc",label: "Eventos",   icon: <AlertTriangle className="w-4 h-4" /> },
          ]}
        />

        {/* Export */}
        <div className="ml-auto">
          <button onClick={onExport} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">
            <Download className="inline w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>
    </section>
  );
}
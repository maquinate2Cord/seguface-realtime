"use client";
import React from "react";
export type RangeKey = "15m"|"1h"|"24h";

export default function ToolbarProV3({
  q, onQ, onlyActive, onOnlyActive, minScore, onMinScore, sort, onSort, range, onRangeChange, onExport
}:{
  q:string; onQ:(v:string)=>void;
  onlyActive:boolean; onOnlyActive:(v:boolean)=>void;
  minScore:number; onMinScore:(v:number)=>void;
  sort:"scoreAsc"|"scoreDesc"|"eventsDesc"; onSort:(v:"scoreAsc"|"scoreDesc"|"eventsDesc")=>void;
  range:RangeKey; onRangeChange:(v:RangeKey)=>void;
  onExport:()=>void;
}){
  const Chip = ({v}:{v:RangeKey}) => {
    const active = range===v;
    return (
      <button onClick={()=>onRangeChange(v)}
        className={`px-2.5 py-1 rounded-lg border text-xs transition
          ${active ? "bg-white border-slate-300" : "bg-slate-50 border-slate-200 hover:bg-white"}`}>
        {v}
      </button>
    );
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex flex-col gap-3">
        <input
          value={q} onChange={(e)=>onQ(e.target.value)}
          placeholder="Buscar conductor (user_001)…"
          className="px-3 py-2 rounded-lg border border-slate-300 bg-white w-full"
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-slate-300 bg-slate-50">
            <input type="checkbox" className="accent-emerald-600" checked={onlyActive} onChange={(e)=>onOnlyActive(e.target.checked)} />
            <span>Solo activos (5m)</span>
          </label>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50">
            <span className="text-xs text-slate-500">Score ≥ {minScore}</span>
            <input type="range" min={0} max={100} step={1} value={minScore} onChange={(e)=>onMinScore(Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs text-slate-500">Orden</span>
            <select value={sort} onChange={(e)=>onSort(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white">
              <option value="scoreAsc">Score ↑</option>
              <option value="scoreDesc">Score ↓</option>
              <option value="eventsDesc">Eventos</option>
            </select>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Chip v="15m" /><Chip v="1h" /><Chip v="24h" />
            <button onClick={onExport}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm">
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
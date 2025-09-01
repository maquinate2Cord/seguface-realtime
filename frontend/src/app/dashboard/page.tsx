"use client";

import React, { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import dynamic from "next/dynamic";

import SideNavPro, { type TabKey } from "@/components/SideNavPro";
import SoftCard from "@/components/SoftCard";
import DonutKPI from "@/components/DonutKPI";
import GaugeSemi from "@/components/GaugeSemi";
import SimpleLine from "@/components/SimpleLine";
import SimpleBars from "@/components/SimpleBars";

/* Pesados que ya tenés */
const RiskMap    = dynamic(() => import("@/components/RiskMap"),    { ssr:false, loading:()=> <div className="h-80 animate-pulse bg-slate-100 rounded-xl" /> });
const ScoreTable = dynamic(() => import("@/components/ScoreTable"), { ssr:false, loading:()=> <div className="h-40 animate-pulse bg-slate-100 rounded-xl" /> });

type Row = { userId:string; score:number; lastTs:number; events:number };
type TrendPoint = { ts:number; avg:number };
type RiskEvt = { userId:string; ts:number; type:"overSpeed"|"hardBrake"|"hardAccel"; lat:number; lng:number; severity:number };

function TopBar() {
  return (
    <header className="h-14 grid grid-cols-[1fr_auto] items-center border-b border-slate-200 px-4 bg-white">
      <div className="flex items-center gap-3">
        <div className="font-semibold tracking-tight">Seguface Dashboard</div>
        <span className="hidden md:inline text-xs text-slate-500">Soft UI · Realtime</span>
      </div>
    </header>
  );
}

export default function DashboardPage(){
  const [tab, setTab] = useState<TabKey>("realtime");
  const [rows, setRows] = useState<Row[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [dist, setDist] = useState<number[]>([]);
  const [events, setEvents] = useState<RiskEvt[]>([]);

  useEffect(()=>{
    fetch("http://localhost:4000/dashboard").then(r=>r.json()).then(j=>{
      setRows(j.scores ?? []); setTrend(j.trend ?? []); setDist(j.distribution ?? []); setEvents(j.events ?? []);
    }).catch(()=>{});
    const s = io("http://localhost:4000", { transports: ["websocket"] });
    s.on("score:update", (msg:{state:Row})=>{
      setRows(prev=>{
        const m = new Map(prev.map(r=>[r.userId,r])); m.set(msg.state.userId, {...(m.get(msg.state.userId)||{}), ...msg.state}); return Array.from(m.values());
      });
    });
    s.on("risk:event", ({event}:{event:RiskEvt})=> setEvents(p=>[...p.slice(-199), event]));
    return ()=>{ try{s.off("score:update"); s.off("risk:event"); s.disconnect();}catch{} };
  },[]);

  /* KPIs y datos derivados */
  const now = Date.now();
  const total = rows.length;
  const active = rows.filter(r=> now - (r.lastTs||0) <= 5*60*1000 ).length;
  const activePct = total? active/total : 0;
  const avgScore = total? rows.reduce((a,b)=>a+(b.score||0),0)/total : 0;

  // Severos 24h y eventos/min (15m)
  const severe24h = events.filter(e=> now - e.ts <= 24*60*60*1000 && e.severity>=0.8).length;
  const win = 15*60*1000; const recent = events.filter(e=> now - e.ts <= win).sort((a,b)=>a.ts-b.ts);
  const spark = Array.from({length:15},(_,i)=>{ const t0=now-win+i*(win/15), t1=t0+(win/15); return recent.filter(e=>e.ts>=t0 && e.ts<t1).length; });

  // Línea compacta (normalizamos trend.avg)
  const miniLine = (trend.length? trend : [{avg:avgScore},{avg:avgScore}]).map(p=>p.avg||0).slice(-12);

  // Barras compactas desde distribución (5 buckets)
  const labels = ["<60","60-69","70-79","80-89","90-100"];
  const bars = (dist.length? dist : [1,1,1,1,1]).slice(0,5);

  // Orden para la tabla (peores primero)
  const orderedRows = [...rows].sort((a,b)=> (a.score??0)-(b.score??0) || (b.events??0)-(a.events??0));

  /* ===== Realtime (diseño Soft UI como la imagen) ===== */
  const Realtime = (
    <>
      {/* Fila 1: donut, mini línea, barras, gauge */}
      <div className="grid grid-cols-12 gap-4">
        <SoftCard title="Activos" subtitle="% activos (5m)" className="col-span-12 md:col-span-3">
          <DonutKPI value={activePct} label="Activos" />
        </SoftCard>
        <SoftCard title="Tendencia corta" subtitle="Score promedio (mini)" className="col-span-12 md:col-span-3">
          <SimpleLine points={miniLine} />
        </SoftCard>
        <SoftCard title="Distribución" subtitle="Buckets de score" className="col-span-12 md:col-span-3">
          <SimpleBars values={bars} labels={labels} />
        </SoftCard>
        <SoftCard title="Salud de score" subtitle="Gauge 0–100" className="col-span-12 md:col-span-3">
          <GaugeSemi value={avgScore||0} label="Score prom." />
        </SoftCard>
      </div>

      {/* Fila 2: línea principal + resumen (como “General stats / Main schedule”) */}
      <div className="grid grid-cols-12 gap-4">
        <SoftCard title="General stats" subtitle="Eventos por minuto (últ. 15m)" className="col-span-12 md:col-span-8">
          <SimpleLine points={spark} />
          <div className="mt-2 text-xs text-slate-500">Severos 24h: <b>{severe24h}</b></div>
        </SoftCard>
        <SoftCard title="Resumen por bucket" subtitle="Conteo actual" className="col-span-12 md:col-span-4">
          <SimpleBars values={bars} labels={labels} />
        </SoftCard>
      </div>

      {/* Fila 3: mapa + tabla */}
      <div className="grid grid-cols-12 gap-4">
        <SoftCard title="Mapa de riesgos" subtitle="Eventos recientes" className="col-span-12 lg:col-span-7">
          <div className="h-80"><RiskMap events={events as any} /></div>
        </SoftCard>
        <SoftCard title="Top riesgos" subtitle="Peores conductores" className="col-span-12 lg:col-span-5">
          <div className="max-h-[320px] overflow-auto">
            {/* Tabla compacta (reutilizamos ScoreTable si prefieres, aquí mostramos la completa abajo) */}
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr><th className="py-2 pr-3">Conductor</th><th className="py-2 pr-3">Score</th><th className="py-2 pr-3">Eventos</th></tr>
              </thead>
              <tbody>
                {orderedRows.slice(0,10).map(r=>(
                  <tr key={r.userId} className="border-t border-slate-100">
                    <td className="py-1 pr-3 font-mono">{r.userId}</td>
                    <td className="py-1 pr-3">{(r.score??0).toFixed(1)}</td>
                    <td className="py-1 pr-3">{r.events??0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SoftCard>
      </div>

      {/* Detalle completo */}
      <SoftCard title="Detalle operativo" subtitle="Listado completo">
        <ScoreTable rows={rows as any} seriesByUser={{} as any} lastRiskByUser={{} as any} />
      </SoftCard>
    </>
  );

  return (
    <div className="min-h-screen grid grid-rows-[56px_1fr] bg-slate-50 text-slate-900">
      <TopBar />
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 px-4 py-4">
        <SideNavPro value={tab} onChange={setTab} />
        <main className="space-y-6">
          {tab === "realtime" && Realtime}
          {tab !== "realtime" && (
            <SoftCard title="Sección en construcción" subtitle={`Próximamente: ${tab}`}>
              <div className="text-sm text-slate-500">Integraremos vistas con el mismo estilo Soft UI.</div>
            </SoftCard>
          )}
        </main>
      </div>
    </div>
  );
}
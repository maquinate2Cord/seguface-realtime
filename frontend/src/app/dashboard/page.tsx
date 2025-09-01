"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import dynamic from "next/dynamic";

import SideNavPro, { type TabKey } from "@/components/SideNavPro";
import ExecKpis from "@/components/ExecKpis";
import RiskRateSpark from "@/components/RiskRateSpark";
import EventsFeed from "@/components/EventsFeed";
import IngestionHealth from "@/components/IngestionHealth";
import TopOffendersTable from "@/components/TopOffendersTable";

/** Pesados: se cargan en client */
const TrendChart      = dynamic(() => import("@/components/TrendChart"),      { ssr: false, loading: () => <div className="h-72 animate-pulse bg-slate-100 rounded-xl" /> });
const HistogramScores = dynamic(() => import("@/components/HistogramScores"), { ssr: false, loading: () => <div className="h-72 animate-pulse bg-slate-100 rounded-xl" /> });
const RiskMap         = dynamic(() => import("@/components/RiskMap"),         { ssr: false, loading: () => <div className="h-80 animate-pulse bg-slate-100 rounded-xl" /> });
const ScoreTable      = dynamic(() => import("@/components/ScoreTable"),      { ssr: false, loading: () => <div className="h-40 animate-pulse bg-slate-100 rounded-xl" /> });

/** Tipos mínimos **/
type Row = { userId: string; score: number; lastTs: number; events: number };
type Point = { ts: number; avg: number };
type RiskEvt = { userId: string; ts: number; type: "overSpeed" | "hardBrake" | "hardAccel"; lat: number; lng: number; severity: number };

function TopBar() {
  return (
    <header className="h-14 grid grid-cols-[1fr_auto] items-center border-b border-slate-200 px-4 bg-white">
      <div className="flex items-center gap-3">
        <div className="font-semibold tracking-tight">Seguface Dashboard</div>
        <span className="hidden md:inline text-xs text-slate-500">Realtime · Portfolio · Model</span>
      </div>
    </header>
  );
}

function Panel({ title, subtitle, className = "", children }:{
  title: string; subtitle?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white ${className}`}>
      <header className="px-4 pt-3 pb-2 border-b border-slate-100">
        <div className="text-sm font-semibold">{title}</div>
        {subtitle ? <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div> : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function DashboardPage() {
  const [tab, setTab] = useState<TabKey>("realtime");

  const [rows, setRows]     = useState<Row[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [series, setSeries] = useState<Point[]>([]);
  const [events, setEvents] = useState<RiskEvt[]>([]);

  // bootstrap + realtime
  useEffect(() => {
    fetch("http://localhost:4000/dashboard")
      .then(r => r.json())
      .then(j => {
        setRows(j.scores ?? []);
        setScores(j.distribution ?? []);
        setSeries(j.trend ?? []);
        setEvents(j.events ?? []);
      }).catch(()=>{});

    const socket = io("http://localhost:4000", { transports: ["websocket"] });
    socket.on("score:update", (msg: { state: Row }) => {
      setRows(prev => {
        const map = new Map(prev.map(r => [r.userId, r]));
        map.set(msg.state.userId, { ...(map.get(msg.state.userId) || {}), ...msg.state });
        return Array.from(map.values());
      });
    });
    socket.on("risk:event", (payload: { event: RiskEvt }) => {
      setEvents(prev => [...prev.slice(-199), payload.event]);
    });

    return () => {
      try { socket.off("score:update"); } catch {}
      try { socket.off("risk:event"); } catch {}
      try { socket.disconnect(); } catch {}
      try { (socket as any).close?.(); } catch {}
    };
  }, []);

  // Derivados / KPIs
  const now = Date.now();
  const total    = rows.length;
  const active   = rows.filter(r => now - r.lastTs <= 5*60*1000).length;
  const avgScore = total ? rows.reduce((a,b)=>a+(b.score??0),0)/total : 0;
  const severe24h = events.filter(e => now - e.ts <= 24*60*60*1000 && e.severity >= 0.8).length;

  // Riesgo/minuto (ventana 15m) + sparkline de 15 puntos ~ 1 punto/min
  const win = 15*60*1000;
  const recent = events.filter(e => now - e.ts <= win).sort((a,b)=>a.ts-b.ts);
  const riskRateMin = win ? recent.length / 15 : 0;
  const spark = Array.from({length:15}, (_,i)=>{
    const t0 = now - win + i*(win/15);
    const t1 = t0 + (win/15);
    return recent.filter(e => e.ts>=t0 && e.ts<t1).length;
  });

  // Ingesta
  const lastTs = rows.reduce((m,r)=>Math.max(m, r.lastTs||0), 0);
  const freshnessSec = lastTs ? (now - lastTs)/1000 : 0;
  const activePct = total ? active/total : 0;

  // Orden del detalle (peores primero)
  const offenders = [...rows].sort((a,b)=>{
    const sa=a.score??0, sb=b.score??0;
    if (sa!==sb) return sa-sb;
    return (b.events??0)-(a.events??0);
  });

  // ========= Vistas =========

  const Realtime = (
    <>
      {/* KPIs ejecutivos */}
      <ExecKpis total={total} active={active} avgScore={avgScore} riskRateMin={riskRateMin} severe24h={severe24h} />

      {/* Monitoreo superior */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-12 lg:col-span-4">
          <Panel title="Riesgo en tiempo real" subtitle="Eventos por minuto (últ. 15m)">
            <RiskRateSpark points={spark} />
          </Panel>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <Panel title="Ingesta / Telemetría">
            <IngestionHealth freshnessSec={freshnessSec} activePct={activePct} />
          </Panel>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <Panel title="Feed de alertas" subtitle="Top 10 recientes">
            <EventsFeed events={events as any} />
          </Panel>
        </div>
      </div>

      {/* Vista geo + top offenders */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-12 xl:col-span-7">
          <Panel title="Mapa de eventos" subtitle="Ubicación y severidad">
            <div className="h-80"><RiskMap events={events as any} /></div>
          </Panel>
        </div>
        <div className="col-span-12 xl:col-span-5">
          <TopOffendersTable rows={offenders as any} />
        </div>
      </div>

      {/* Tendencia + distribución */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-12 xl:col-span-7">
          <Panel title="Tendencia (pulso global)" subtitle="Score promedio vs. tiempo">
            <div className="h-72"><TrendChart series={series} /></div>
          </Panel>
        </div>
        <div className="col-span-12 xl:col-span-5">
          <Panel title="Distribución de scores" subtitle="Última ventana">
            <div className="h-72"><HistogramScores scores={scores} /></div>
          </Panel>
        </div>
      </div>

      {/* Detalle operativo */}
      <div className="mt-4">
        <Panel title="Detalle operativo">
          <ScoreTable rows={rows as any} seriesByUser={{} as any} lastRiskByUser={{} as any} />
        </Panel>
      </div>
    </>
  );

  return (
    <div className="min-h-screen grid grid-rows-[56px_1fr] bg-slate-50 text-slate-900">
      <TopBar />
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 px-4 py-4">
        <SideNavPro value={tab} onChange={setTab} />
        <main className="space-y-6">
          {tab === "realtime"  && Realtime}
          {tab !== "realtime"  && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Sección "{tab}" pendiente de contenido nuevo. (Portfolio/Drivers/Claims/Model/Sim)
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
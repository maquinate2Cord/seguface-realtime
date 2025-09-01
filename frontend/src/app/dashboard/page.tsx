"use client";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import dynamic from "next/dynamic";

import ConnectionBadge from "@/components/ConnectionBadge";
import EnhancedKPIs from "@/components/EnhancedKPIs";
import HistogramScores from "@/components/HistogramScores";
import TrendChart from "@/components/TrendChart";
import RiskMap from "@/components/RiskMap";
import MultiUserChart from "@/components/MultiUserChart";
import ScoreTable from "@/components/ScoreTable";

import PercentilesBands from "@/components/PercentilesBands";
import EventsHeatmap from "@/components/EventsHeatmap";
import QualityPanel from "@/components/QualityPanel";
import LiveAlerts from "@/components/LiveAlerts";
import LiftDecilesChart from "@/components/LiftDecilesChart";
import ExpectedLossPanel from "@/components/ExpectedLossPanel";
import ClaimsAgingPanel from "@/components/ClaimsAgingPanel";

import DriftPanel from "@/components/DriftPanel";
import CalibrationChart from "@/components/CalibrationChart";
import ModelHealthBadge from "@/components/ModelHealthBadge";

const SimConfigPanel = dynamic(() => import("@/components/SimConfigPanel"), { ssr: false });

type Status = "connected" | "connecting" | "disconnected";
type Row = { userId: string; score: number; lastTs: number; events: number };
type Point = { ts: number; avg: number };
type RiskEvt = { userId: string; ts: number; type: "overSpeed" | "hardBrake" | "hardAccel"; lat: number; lng: number; severity: number };

type PortfolioMetrics = { totalDrivers: number; activeVehicles: number; avgScore: number; highRisk: number; updatedAt: number };
type Analytics = { buckets: { name: "High" | "Medium" | "Low"; count: number }[]; topRisk: { userId: string; score: number; lastTs: number; events: number }[] };

type Tab = "realtime" | "portfolio" | "claims" | "drivers" | "sim" | "model";


import FilterBarPro from "@/components/FilterBarPro";
import WidgetCard from "@/components/WidgetCard";
import TimeRangeChips, { type RangeKey } from "@/components/TimeRangeChips";
import Section from "@/components/Section";
import MetricTilesV2 from "@/components/MetricTilesV2";
import UXToolbar, { type RangeKey } from "@/components/UXToolbar";
import Panel from "@/components/Panel";
import StatRibbon from "@/components/StatRibbon";
import ToolbarProV3, { type RangeKey } from "@/components/ToolbarProV3";
export default function DashboardPage() {
  const [status, setStatus] = useState<Status>("connecting");
  const [rows, setRows] = useState<Row[]>([]);
  const [series, setSeries] = useState<Point[]>([]);
  const [events, setEvents] = useState<RiskEvt[]>([]);
  const [seriesByUser, setSeriesByUser] = useState<Record<string, { ts: number; score: number }[]>>({});
  const lastRiskByUser = useRef<Record<string, RiskEvt | undefined>>({});
  const buffer = useRef<number[]>([]);
  const [tab, setTab] = useState<Tab>("realtime");
  const [range, setRange] = useState<"15m"|"1h"|"24h">("1h");

  // Filtros Realtime
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState<"scoreAsc" | "scoreDesc" | "eventsDesc">("scoreAsc");

  // Portfolio fetches
  const [portfolio, setPortfolio] = useState<PortfolioMetrics | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [percentiles, setPercentiles] = useState<{p10:number; p50:number; p90:number} | null>(null);
  const [heatmap, setHeatmap] = useState<number[][] | null>(null);
  const [lift, setLift] = useState<any[] | null>(null);
  const [eloss, setEloss] = useState<any[] | null>(null);

  // Claims
  const [aging, setAging] = useState<any[] | null>(null);

  // Calidad
  const [quality, setQuality] = useState<any>(null);

  // MODEL / MLOps
  const [drift, setDrift] = useState<any>(null);
  const [calib, setCalib] = useState<any>(null);
  const [brier, setBrier] = useState<number | null>(null);
  const [health, setHealth] = useState<any>(null);

  // Socket bootstrap
  useEffect(() => {
    const socket = io("http://localhost:4000", { transports: ["websocket"] });
    socket.on("connect", () => setStatus("connected"));
    socket.on("disconnect", () => setStatus("disconnected"));
    socket.on("connect_error", () => setStatus("disconnected"));

    socket.on("bootstrap", (p: { items: Row[] }) => setRows(p.items || []));
    socket.on("score:update", (msg: { state: Row }) => {
      setRows((prev) => {
        const m = new Map<string, Row>(prev.map((r) => [r.userId, r]));
        m.set(msg.state.userId, msg.state);
        return Array.from(m.values());
      });
      buffer.current.push(msg.state.score);
      setSeriesByUser((prev) => {
        const next = { ...prev };
        const arr = next[msg.state.userId] || [];
        arr.push({ ts: Date.now(), score: msg.state.score });
        next[msg.state.userId] = arr.slice(-200);
        return next;
      });
    });
    socket.on("risk:event", (payload: { event: RiskEvt }) => {
      setEvents((prev) => [...prev.slice(-499), payload.event]);
      lastRiskByUser.current[payload.event.userId] = payload.event;
    });

    const id = setInterval(() => {
      if (buffer.current.length) {
        const avg = buffer.current.reduce((a, b) => a + b, 0) / buffer.current.length;
        buffer.current = [];
        setSeries((s) => [...s.slice(-200), { ts: Date.now(), avg }]);
      } else {
        setSeries((s) => [...s.slice(-200), { ts: Date.now(), avg: s.at(-1)?.avg ?? 80 }]);
      }
    }, 3000);

    return () => { clearInterval(id); socket.close(); };
  }, []);

  // Carga por solapa
  useEffect(() => {
    if (tab === "portfolio") {
      fetch("http://localhost:4000/metrics").then(r=>r.json()).then(j=>setPortfolio(j.metrics)).catch(()=>setPortfolio(null));
      fetch("http://localhost:4000/analytics").then(r=>r.json()).then(j=>setAnalytics(j.analytics)).catch(()=>setAnalytics(null));
      fetch("http://localhost:4000/portfolio/percentiles").then(r=>r.json()).then(j=>setPercentiles(j.percentiles)).catch(()=>setPercentiles(null));
      fetch("http://localhost:4000/events/heatmap?days=7").then(r=>r.json()).then(j=>setHeatmap(j.matrix)).catch(()=>setHeatmap(null));
      fetch("http://localhost:4000/portfolio/lift?days=90&bins=10").then(r=>r.json()).then(j=>setLift(j.items)).catch(()=>setLift(null));
      fetch("http://localhost:4000/loss/expected?days=30&by=bucket").then(r=>r.json()).then(j=>setEloss(j.items)).catch(()=>setEloss(null));
    }
    if (tab === "claims") {
      fetch("http://localhost:4000/claims/aging?days=90").then(r=>r.json()).then(j=>setAging(j.items)).catch(()=>setAging(null));
    }
    if (tab === "model") {
      fetch("http://localhost:4000/model/drift?bins=20").then(r=>r.json()).then(setDrift).catch(()=>setDrift(null));
      fetch("http://localhost:4000/model/calibration?days=90&bins=10&beta=0.25").then(r=>r.json()).then(setCalib).catch(()=>setCalib(null));
      fetch("http://localhost:4000/model/brier?days=90&beta=0.25").then(r=>r.json()).then(j=>setBrier(j.brier)).catch(()=>setBrier(null));
      fetch("http://localhost:4000/model/health?bins=20&days=90&beta=0.25").then(r=>r.json()).then(setHealth).catch(()=>setHealth(null));
    }
  }, [tab]);

  // KPIs globales
  const now = Date.now();
  const active = rows.filter((r) => now - r.lastTs <= 5 * 60 * 1000).length;
  const avgScore = rows.length ? rows.reduce((a, b) => a + b.score, 0) / rows.length : 0;
  const highRisk = rows.filter((r) => r.score < 60).length;
  const criticalEvents = events.filter((e) => e.severity >= 4 && now - e.ts <= 15 * 60 * 1000).length;
  const scores = rows.map((r) => r.score);

  // Filtros RT
  const filteredRows = React.useMemo(() => {
    let list = rows;
    if (q.trim()) list = list.filter(r => r.userId.toLowerCase().includes(q.trim().toLowerCase()));
    if (onlyActive) list = list.filter(r => now - r.lastTs <= 5*60*1000);
    if (minScore > 0) list = list.filter(r => r.score >= minScore);
    switch (sort) {
      case "scoreAsc":  list = [...list].sort((a,b)=>a.score-b.score); break;
      case "scoreDesc": list = [...list].sort((a,b)=>b.score-a.score); break;
      case "eventsDesc":list = [...list].sort((a,b)=>b.events-a.events); break;
    }
    return list;
  }, [rows, q, onlyActive, minScore, sort, now]);

  const filteredUserIds = React.useMemo(()=> new Set(filteredRows.map(r=>r.userId)), [filteredRows]);
  const seriesByUserFiltered = React.useMemo(()=>{
    const out: Record<string, { ts:number; score:number }[]> = {};
    for (const k of Object.keys(seriesByUser)) if (filteredUserIds.has(k)) out[k] = seriesByUser[k];
    return out;
  }, [seriesByUser, filteredUserIds]);
  const eventsFiltered = React.useMemo(()=> events.filter(e=>filteredUserIds.has(e.userId)), [events, filteredUserIds]);

  // Export CSV (tabla filtrada)
  const exportCsv = () => {
    const header = "userId,score,events,lastTs\n";
    const body = filteredRows.map(r => `${r.userId},${r.score.toFixed(2)},${r.events},${r.lastTs}`).join("\n");
    const blob = new Blob([header+body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "realtime_filtered.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Reset baseline drift
  const resetBaseline = async () => {
    await fetch("http://localhost:4000/model/baseline/snapshot?bins=20", { method: "POST" });
    const d = await fetch("http://localhost:4000/model/drift?bins=20").then(r=>r.json());
    setDrift(d);
    const h = await fetch("http://localhost:4000/model/health?bins=20&days=90&beta=0.25").then(r=>r.json());
    setHealth(h);
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-6 flex items-center justify-between sticky top-0 bg-white/70 backdrop-blur z-10 p-2 rounded-xl border border-slate-200">
        <h1 className="text-2xl md:text-3xl font-bold">Seguface Dashboard</h1>
        <div className="flex items-center gap-3">
          {health ? <ModelHealthBadge status={health.status} psi={health.psi} ks={health.ks} brier={health.brier} /> : null}
          <ConnectionBadge status={status} />
        </div>
      </header>

      {/* Tabs */}
      <nav className="mb-6 flex gap-2">
        {(["realtime","portfolio","claims","drivers","sim","model"] as Tab[]).map((key) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-3 py-2 rounded-xl border ${tab===key ? "bg-slate-800 text-white border-slate-700" : "bg-slate-100 text-slate-700 border-slate-300"}`}>
            {key.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* REALTIME */}
      {tab === "realtime" && (
  <>
    <PageHeaderPro title="Realtime • Flota" status={"Conectado"} />

    <div className="grid grid-cols-12 gap-5">
      {/* Rail izquierdo: resumen + filtros */}
      <aside className="col-span-12 lg:col-span-3 space-y-4">
        <Panel title="Resumen ejecutivo">
          <StatRibbon
            total={rows.length}
            active={active}
            avgScore={avgScore}
            highRisk={highRisk}
            criticalEvents={criticalEvents}
          />
        </Panel>
        <Panel title="Filtros">
          <ToolbarProV3
            q={q}
            onQ={setQ}
            onlyActive={onlyActive}
            onOnlyActive={setOnlyActive}
            minScore={minScore}
            onMinScore={setMinScore}
            sort={sort}
            onSort={setSort}
            range={range as any}
            onRangeChange={setRange as any}
            onExport={exportCsv}
          />
        </Panel>
      </aside>

      {/* Área principal */}
      <section className="col-span-12 lg:col-span-9 space-y-4">
        <Panel title="Tendencia (pulso global)" subtitle="Score promedio vs. tiempo">
          <div className="h-80"><TrendChart series={series} /></div>
        </Panel>

        <div className="grid grid-cols-12 gap-4">
          <Panel className="col-span-12 lg:col-span-5" title="Distribución de scores" subtitle="Última ventana">
            <div className="h-72"><HistogramScores scores={scores} /></div>
          </Panel>
          <Panel className="col-span-12 lg:col-span-7" title="Series por usuario (filtrado)" subtitle="Top N por actividad">
            <div className="h-72"><MultiUserChart seriesByUser={seriesByUserFiltered} limit={8} /></div>
          </Panel>
        </div>

        <Panel title="Mapa de eventos de riesgo (filtrados)" subtitle="Ubicación y severidad">
          <div className="h-80"><RiskMap events={eventsFiltered} /></div>
        </Panel>
      </section>

      {/* Operación: tabla completa */}
      <div className="col-span-12">
        <Panel title="Detalle operativo (filtrado)" subtitle="Abrí un conductor para ver su ficha">
          <ScoreTable
            rows={filteredRows}
            seriesByUser={seriesByUserFiltered}
            lastRiskByUser={lastRiskByUser.current}
          />
        </Panel>
      </div>
    </div>
  </>
)}

      {/* PORTFOLIO */}
      {tab === "portfolio" && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            {portfolio
              ? <div className="mb-4 p-4 rounded-xl border border-slate-200 bg-white text-slate-700">
                  <div className="text-sm">Metrics</div>
                  <div className="text-xl font-semibold">
                    Drivers: {portfolio.totalDrivers} · Activos: {portfolio.activeVehicles} · Avg: {portfolio.avgScore} · HighRisk: {portfolio.highRisk}
                  </div>
                </div>
              : <div className="text-sm text-slate-500">Cargando métricas…</div>}
          </div>

          <div className="lg:col-span-2">
            {percentiles ? <PercentilesBands p10={percentiles.p10} p50={percentiles.p50} p90={percentiles.p90} /> : <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-500 text-sm">Cargando percentiles…</div>}
          </div>
          <div>
            {heatmap ? <EventsHeatmap matrix={heatmap} /> : <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-500 text-sm">Cargando heatmap…</div>}
          </div>

          <div className="lg:col-span-2">
            {lift ? <LiftDecilesChart items={lift} /> : <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-500 text-sm">Cargando lift…</div>}
          </div>
          <div>
            {eloss ? <ExpectedLossPanel rows={eloss} /> : <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-500 text-sm">Cargando expected loss…</div>}
          </div>
        </section>
      )}

      {/* CLAIMS */}
      {tab === "claims" && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            {aging ? <ClaimsAgingPanel rows={aging} /> : <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-500 text-sm">Cargando aging…</div>}
          </div>
        </section>
      )}

      {/* DRIVERS */}
      {tab === "drivers" && (
        <section className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          <div className="text-sm text-slate-500">Usá Realtime para buscar/filtrar y abrir el detalle desde la tabla.</div>
        </section>
      )}

      {/* SIM */}
      {tab === "sim" && (
        <section className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          <SimConfigPanel />
        </section>
      )}

      {/* MODEL */}
      {tab === "model" && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            {drift
              ? <DriftPanel psi={drift.psi} ks={drift.ks} bins={drift.current.bins} base={drift.baseline.probs} cur={drift.current.probs} onReset={resetBaseline} />
              : <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-500 text-sm">Cargando drift…</div>}
          </div>
          <div className="lg:col-span-2">
            {calib
              ? <CalibrationChart items={calib.items} mae={calib.mae} brier={typeof brier==="number"?brier:undefined} />
              : <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-500 text-sm">Cargando calibración…</div>}
          </div>
          <div>
            {health
              ? <ModelHealthBadge status={health.status} psi={health.psi} ks={health.ks} brier={health.brier} />
              : <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-500 text-sm">Cargando health…</div>}
          </div>
        </section>
      )}
    </main>
  );
}
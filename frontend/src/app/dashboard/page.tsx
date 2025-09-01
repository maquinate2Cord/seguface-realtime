"use client";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import dynamic from "next/dynamic";

import ConnectionBadge from "../../components/ConnectionBadge";
import KPICards from "../../components/KPICards";
import HistogramScores from "../../components/HistogramScores";
import TrendChart from "../../components/TrendChart";
import RiskMap from "../../components/RiskMap";
import MultiUserChart from "../../components/MultiUserChart";
import ScoreTable from "../../components/ScoreTable";

// Pro panels (cargados dinámicamente, con fallback seguro)
const Safe = (msg: string) => () => <div className="text-sm text-slate-400">{msg}</div>;
const PortfolioCards = dynamic(() => import("../../components/PortfolioCards").then(m => m.default).catch(() => Promise.resolve(Safe("PortfolioCards no disponible"))), { ssr: false });
const ClaimsPanel    = dynamic(() => import("../../components/ClaimsPanel").then(m => m.default).catch(() => Promise.resolve(Safe("ClaimsPanel no disponible"))), { ssr: false });
const RiskBucketsChart = dynamic(() => import("../../components/RiskBucketsChart").then(m => m.default).catch(() => Promise.resolve(Safe("RiskBucketsChart no disponible"))), { ssr: false });
const TopRiskTable   = dynamic(() => import("../../components/TopRiskTable").then(m => m.default).catch(() => Promise.resolve(Safe("TopRiskTable no disponible"))), { ssr: false });
const ReasonCodesPanel = dynamic(() => import("../../components/ReasonCodesPanel").then(m => m.default).catch(() => Promise.resolve(Safe("ReasonCodesPanel no disponible"))), { ssr: false });
const DriftPanel     = dynamic(() => import("../../components/DriftPanel").then(m => m.default).catch(() => Promise.resolve(Safe("DriftPanel no disponible"))), { ssr: false });
const CalibrationChart = dynamic(() => import("../../components/CalibrationChart").then(m => m.default).catch(() => Promise.resolve(Safe("CalibrationChart no disponible"))), { ssr: false });


const SimConfigPanel = dynamic(() => import("../../components/SimConfigPanel").then(m => m.default).catch(() => Promise.resolve(Safe("SimConfigPanel no disponible"))), { ssr: false });
type Status = "connected" | "connecting" | "disconnected";
type Row = { userId: string; score: number; lastTs: number; events: number };
type Point = { ts: number; avg: number };
type RiskEvt = { userId: string; ts: number; type: "overSpeed" | "hardBrake" | "hardAccel"; lat: number; lng: number; severity: number };

type PortfolioMetrics = { totalDrivers: number; activeVehicles: number; avgScore: number; highRisk: number; updatedAt: number };
type Analytics = { buckets: { name: "High" | "Medium" | "Low"; count: number }[], topRisk: { userId: string; score: number; lastTs: number; events: number }[] };
type Claim = { id: string; userId: string; ts: number; type?: string; severity?: number; amountUsd?: number; status?: string; lat?: number; lng?: number; description?: string };

export default function DashboardPage() {
  const [status, setStatus] = useState<Status>("connecting");
  const [rows, setRows] = useState<Row[]>([]);
  const [series, setSeries] = useState<Point[]>([]);
  const [events, setEvents] = useState<RiskEvt[]>([]);
  const [seriesByUser, setSeriesByUser] = useState<Record<string, { ts: number; score: number }[]>>({});
  const lastRiskByUser = useRef<Record<string, RiskEvt | undefined>>({});
  const buffer = useRef<number[]>([]);
  const limit = 8;

  const [tab, setTab] = useState<"realtime"|"portfolio"|"claims"|"drivers">("realtime");
  const [portfolio, setPortfolio] = useState<PortfolioMetrics | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [claims, setClaims] = useState<Claim[] | null>(null);

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

  // Fetch por tab
  useEffect(() => {
    if (tab === "portfolio") {
      fetch("http://localhost:4000/metrics").then(r => r.json()).then(j => setPortfolio(j.metrics)).catch(() => setPortfolio(null));
      fetch("http://localhost:4000/analytics").then(r => r.json()).then(j => setAnalytics(j.analytics)).catch(() => setAnalytics(null));
    }
    if (tab === "claims") {
      fetch("http://localhost:4000/claims?days=90").then(r => r.json()).then(j => setClaims(j.items)).catch(() => setClaims(null));
    }
  }, [tab]);

  const now = Date.now();
  const active = rows.filter((r) => now - r.lastTs <= 5 * 60 * 1000).length;
  const avgScore = rows.length ? rows.reduce((a, b) => a + b.score, 0) / rows.length : 0;
  const highRisk = rows.filter((r) => r.score < 60).length;
  const criticalEvents = events.filter((e) => e.severity >= 4 && now - e.ts <= 15 * 60 * 1000).length;
  const scores = rows.map((r) => r.score);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Seguface Dashboard</h1>
        <ConnectionBadge status={status} />
      </header>

      {/* Tabs */}
      <nav className="mb-6 flex gap-2">
        {[
          ["realtime","Realtime"],
          ["portfolio","Portfolio"],
          ["claims","Claims"],
          ["drivers","Drivers"],
        ].map(([key,label]) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`px-3 py-2 rounded-xl border ${tab===key ? "bg-slate-800 text-white border-slate-700" : "bg-slate-100 text-slate-700 border-slate-300"}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Realtime */}
      {tab === "realtime" && (
        <>
          <KPICards total={rows.length} active={active} avgScore={avgScore} highRisk={highRisk} criticalEvents={criticalEvents} />
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2"><TrendChart series={series} /></div>
            <HistogramScores scores={scores} />
          </section>
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <MultiUserChart seriesByUser={seriesByUser} limit={8} />
              <RiskMap events={events} />
            </div>
            <ScoreTable rows={rows} seriesByUser={seriesByUser} lastRiskByUser={lastRiskByUser.current} />
          </section>
        </>
      )}

      {/* Portfolio */}
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

          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
            {analytics ? <RiskBucketsChart {...(analytics as any)} /> : <div className="text-sm text-slate-500">Cargando buckets…</div>}
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
            {analytics ? <TopRiskTable {...(analytics as any)} /> : <div className="text-sm text-slate-500">Cargando top risk…</div>}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
            <ReasonCodesPanel {...(analytics as any)} />
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
            <DriftPanel {...(analytics as any)} />
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
            <CalibrationChart {...(analytics as any)} />
          </div>
        </section>
      )}

      {/* Claims */}
      {tab === "claims" && (
        <section className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          {claims ? <ClaimsPanel claims={claims as any} /> : <div className="text-sm text-slate-500">Cargando claims…</div>}
        </section>
      )}

      {/* Drivers */}
      {tab === "drivers" && (
        <section className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          <div className="text-sm text-slate-500">
            Explorar detalle por conductor en <code>/dashboard/driver/[id]</code>. Agregá enlaces desde ScoreTable si querés deep-link.
          </div>
        </section>
      )}      {/* Sim */}
      {tab === "sim" && (
        <section className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          <SimConfigPanel />
        </section>
      )}
  

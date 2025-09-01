"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import dynamic from "next/dynamic";

/** Pesados en client (mejor TTFB) */
const TrendChart        = dynamic(() => import("@/components/TrendChart"),        { ssr: false, loading: () => <div className="h-full animate-pulse bg-slate-100 rounded-xl" /> });
const HistogramScores   = dynamic(() => import("@/components/HistogramScores"),   { ssr: false, loading: () => <div className="h-full animate-pulse bg-slate-100 rounded-xl" /> });
const MultiUserChart    = dynamic(() => import("@/components/MultiUserChart"),    { ssr: false, loading: () => <div className="h-full animate-pulse bg-slate-100 rounded-xl" /> });
const RiskMap           = dynamic(() => import("@/components/RiskMap"),           { ssr: false, loading: () => <div className="h-full animate-pulse bg-slate-100 rounded-xl" /> });
const ScoreTable        = dynamic(() => import("@/components/ScoreTable"),        { ssr: false, loading: () => <div className="h-40 animate-pulse bg-slate-100 rounded-xl" /> });

/** Nuevos */
const PortfolioCards    = dynamic(() => import("@/components/PortfolioCards"),    { ssr: false });
const RiskBucketsChart  = dynamic(() => import("@/components/RiskBucketsChart"),  { ssr: false });
const TopRiskTable      = dynamic(() => import("@/components/TopRiskTable"),      { ssr: false });
const CalibrationChart  = dynamic(() => import("@/components/CalibrationChart"),  { ssr: false });
const DriftPanel        = dynamic(() => import("@/components/DriftPanel"),        { ssr: false });

/** ====== Tipos mínimos ====== */
type Row = { userId: string; score: number; lastTs: number; events: number };
type Point = { ts: number; avg: number };
type RiskEvt = { userId: string; ts: number; type: "overSpeed" | "hardBrake" | "hardAccel"; lat: number; lng: number; severity: number };
type Claim = { id: string; userId: string; ts: number; amountUsd?: number; status?: string };

/** ====== UI locales ====== */
function TopBar() {
  return (
    <header className="h-14 grid grid-cols-[1fr_auto] items-center border-b border-slate-200 px-4 bg-white">
      <div className="flex items-center gap-3">
        <div className="font-semibold tracking-tight">Seguface Dashboard</div>
        <span className="hidden md:inline text-xs text-slate-500">Risk, Portfolio & Model</span>
      </div>
    </header>
  );
}

type TabKey = "realtime" | "portfolio" | "claims" | "drivers" | "sim" | "model";

function SideNav({ value, onChange }: { value: TabKey; onChange: (k: TabKey) => void }) {
  const items: { key: TabKey; label: string }[] = [
    { key: "realtime",  label: "Realtime"  },
    { key: "portfolio", label: "Portfolio" },
    { key: "model",     label: "Model"     },
    { key: "drivers",   label: "Drivers"   },
    { key: "claims",    label: "Claims"    },
    { key: "sim",       label: "Sim"       },
  ];
  return (
    <aside className="hidden md:block w-[240px] shrink-0">
      <div className="sticky top-4 rounded-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white px-4 py-3 text-sm font-semibold">Menú</div>
        <nav className="bg-white p-2">
          {items.map((it) => {
            const active = it.key === value;
            return (
              <button
                key={it.key}
                onClick={() => onChange(it.key)}
                className={`w-full text-left rounded-xl px-3 py-2 transition border mb-1
                  ${active ? "bg-slate-900 text-white border-slate-900"
                           : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"}`}
              >
                {it.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function Panel({ title, subtitle, actions, className = "", children }:{
  title: string; subtitle?: string; actions?: React.ReactNode; className?: string; children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white ${className}`}>
      <header className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-end justify-between">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle ? <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div> : null}
        </div>
        {actions}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function KPIRibbon({
  total, active, avgScore, highRisk, criticalEvents,
}: { total: number; active: number; avgScore: number; highRisk: number; criticalEvents: number }) {
  const Item = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <Item label="Conductores"      value={String(total)} />
      <Item label="Activos (5m)"     value={String(active)} />
      <Item label="Score promedio"   value={Number.isFinite(avgScore) ? avgScore.toFixed(1) : "—"} />
      <Item label="Riesgo alto (<60)" value={String(highRisk)} />
      <Item label="Eventos críticos" value={String(criticalEvents)} />
    </div>
  );
}

/** ====== Página ====== */
export default function DashboardPage() {
  const [tab, setTab] = useState<TabKey>("realtime");

  const [rows, setRows]     = useState<Row[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [series, setSeries] = useState<Point[]>([]);
  const [events, setEvents] = useState<RiskEvt[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);

  // filtros realtime
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState<"scoreAsc" | "scoreDesc" | "eventsDesc">("scoreAsc");

  // bootstrap + realtime
  useEffect(() => {
    // dashboard
    fetch("http://localhost:4000/dashboard")
      .then(r => r.json())
      .then(j => {
        setRows(j.scores ?? []);
        setScores(j.distribution ?? []);
        setSeries(j.trend ?? []);
        setEvents(j.events ?? []);
      })
      .catch(()=>{});

    // claims
    fetch("http://localhost:4000/claims?days=365")
      .then(r => r.json())
      .then(j => setClaims(j.items ?? j ?? []))
      .catch(()=>{});

    // socket
    const socket = io("http://localhost:4000", { transports: ["websocket"] });
    socket.on("score:update", (msg: { state: Row }) => {
      setRows((prev) => {
        const map = new Map(prev.map(r => [r.userId, r]));
        map.set(msg.state.userId, { ...(map.get(msg.state.userId) || {}), ...msg.state });
        return Array.from(map.values());
      });
    });
    socket.on("risk:event", (payload: { event: RiskEvt }) => {
      setEvents(prev => [...prev.slice(-199), payload.event]);
    });

    // ✅ cleanup correcto (evita ts2345)
    return () => {
      try { socket.off("score:update"); } catch {}
      try { socket.off("risk:event"); } catch {}
      try { socket.disconnect(); } catch {}
      try { (socket as any).close?.(); } catch {}
    };
  }, []);

  // KPIs realtime
  const now = Date.now();
  const active = useMemo(() => rows.filter(r => now - r.lastTs <= 5*60*1000).length, [rows, now]);
  const avgScore = useMemo(() => rows.length ? rows.reduce((a,b)=>a+(b.score??0),0)/rows.length : 0, [rows]);
  const highRisk = useMemo(() => rows.filter(r => (r.score??0) < 60).length, [rows]);
  const criticalEvents = useMemo(() => events.filter(e => e.severity >= 0.8).length, [events]);

  // tabla realtime filtrada
  const filteredRows = useMemo(() => {
    let out = rows;
    if (q) out = out.filter(r => r.userId.includes(q));
    if (onlyActive) out = out.filter(r => now - r.lastTs <= 5 * 60 * 1000);
    if (minScore) out = out.filter(r => (r.score ?? 0) >= minScore);
    if (sort === "scoreAsc")  out = [...out].sort((a,b) => (a.score ?? 0) - (b.score ?? 0));
    if (sort === "scoreDesc") out = [...out].sort((a,b) => (b.score ?? 0) - (a.score ?? 0));
    if (sort === "eventsDesc") out = [...out].sort((a,b) => (b.events ?? 0) - (a.events ?? 0));
    return out;
  }, [rows, q, onlyActive, minScore, sort, now]);

  // ===== Portfolio: KPIs + Buckets (fallback si no hay endpoint dedicado) =====
  const bucketLabels = ["<60", "60-69", "70-79", "80-89", "90-100"];
  const bucketIdx = (s:number) => (s<60?0:s<70?1:s<80?2:s<90?3:4);

  const portfolio = useMemo(() => {
    // exposición = # conductores únicos
    const exposure = rows.length;
    // severidad y frecuencia desde claims
    const totalClaims = claims.length;
    const totalPaid   = claims.reduce((s,c)=> s + (c.amountUsd ?? 0), 0);
    const freq        = exposure ? totalClaims / exposure : 0;         // por conductor
    const severity    = totalClaims ? totalPaid / totalClaims : 0;
    const pure        = freq * severity;
    const lrProxy     = pure > 0 ? 1.0 : 0; // sin primas reales, dejamos proxy (señal, no contrato)

    // buckets
    const init = Array.from({length:5}, (_,i)=>({ name: bucketLabels[i], count:0, freq:0, severity:0, _claims:0, _paid:0 }));
    const byUser = new Map<string, number>(); // claims por user
    for (const c of claims) byUser.set(c.userId, (byUser.get(c.userId) ?? 0) + 1);

    for (const r of rows) {
      const bi = bucketIdx(r.score ?? 0);
      init[bi].count++;
      const ccount = byUser.get(r.userId) ?? 0;
      init[bi]._claims += ccount;
    }
    // severidad por bucket (usamos monto/claims sólo de quienes están en bucket)
    const paidByUser = claims.reduce((m,c)=> m.set(c.userId, (m.get(c.userId) ?? 0) + (c.amountUsd ?? 0)), new Map<string, number>());
    for (const r of rows) {
      const bi = bucketIdx(r.score ?? 0);
      init[bi]._paid += paidByUser.get(r.userId) ?? 0;
    }
    for (const b of init) {
      b.freq = b.count ? b._claims / b.count : 0;
      b.severity = b._claims ? b._paid / b._claims : 0;
      delete (b as any)._claims;
      delete (b as any)._paid;
    }

    // calibración: predicho (simple) vs observado por bucket
    const baseRate = freq; // usamos frecuencia global como base
    const calData = init.map((b, i) => {
      const midScore = i===0?55:i===1?65:i===2?75:i===3?85:95;
      const pred = Math.max(0, (100 - midScore) / 100) * baseRate * 2; // escala simple
      const obs  = b.freq;
      return { x: i/(init.length-1), label: b.name, pred, obs };
    });

    return {
      exposure, totalClaims, totalPaid, freq, severity, pure, lrProxy,
      buckets: init, calibration: calData
    };
  }, [rows, claims]);

  // Drift: baseline = primera distribución que recibimos
  const baselineRef = useRef<number[] | null>(null);
  if (!baselineRef.current && scores && scores.length) baselineRef.current = [...scores];
  const base = baselineRef.current ?? [1,1,1,1,1];
  const curr = scores && scores.length ? scores : base;

  /** ====== Vistas ====== */

  const Realtime = (
    <>
      <KPIRibbon total={rows.length} active={active} avgScore={avgScore} highRisk={highRisk} criticalEvents={criticalEvents} />

      {/* Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 mt-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            defaultValue={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar conductor (user_001)…"
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white w-64"
          />
          <label className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-slate-300 bg-slate-50">
            <input type="checkbox" className="accent-emerald-600" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            <span>Solo activos (5m)</span>
          </label>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50">
            <span className="text-xs text-slate-500">Score ≥ {minScore}</span>
            <input type="range" min={0} max={100} step={1} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs text-slate-500">Orden</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="scoreAsc">Score ↑</option>
              <option value="scoreDesc">Score ↓</option>
              <option value="eventsDesc">Eventos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Monitoreo */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-12 xl:col-span-8">
          <Panel title="Tendencia (pulso global)" subtitle="Score promedio vs. tiempo">
            <div className="h-72"><TrendChart series={series} /></div>
          </Panel>
        </div>
        <div className="col-span-12 xl:col-span-4">
          <Panel title="Distribución de scores" subtitle="Última ventana">
            <div className="h-72"><HistogramScores scores={scores} /></div>
          </Panel>
        </div>

        <div className="col-span-12 xl:col-span-7">
          <Panel title="Series por usuario (filtrado)" subtitle="Top N por actividad">
            <div className="h-80"><MultiUserChart seriesByUser={{} as any} limit={8} /></div>
          </Panel>
        </div>
        <div className="col-span-12 xl:col-span-5">
          <Panel title="Eventos de riesgo (filtrados)" subtitle="Ubicación y severidad">
            <div className="h-80"><RiskMap events={events as any} /></div>
          </Panel>
        </div>

        <div className="col-span-12">
          <Panel title="Detalle operativo (filtrado)" subtitle="Abrí un conductor para ver su ficha">
            <ScoreTable rows={filteredRows as any} seriesByUser={{} as any} lastRiskByUser={{} as any} />
          </Panel>
        </div>
      </div>
    </>
  );

  const Portfolio = (
    <>
      <PortfolioCards
        exposure={portfolio.exposure}
        claims={portfolio.totalClaims}
        freq={portfolio.freq}
        severity={portfolio.severity}
        pure={portfolio.pure}
        lr={portfolio.lrProxy}
      />
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-12 xl:col-span-7">
          <RiskBucketsChart buckets={portfolio.buckets as any} />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <TopRiskTable rows={rows as any} />
        </div>
      </div>
    </>
  );

  const Model = (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-7">
          <CalibrationChart data={portfolio.calibration.map((p,i)=>({ x:p.x, pred:p.pred, obs:p.obs, label:p.label }))} />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <DriftPanel base={base} curr={curr} labels={["<60","60-69","70-79","80-89","90-100"]} />
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen grid grid-rows-[56px_1fr] bg-slate-50 text-slate-900">
      <TopBar />
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 px-4 py-4">
        <SideNav value={tab} onChange={setTab} />
        <main className="space-y-6">
          {tab === "realtime"  && Realtime}
          {tab === "portfolio" && Portfolio}
          {tab === "model"     && Model}
          {tab === "drivers"   && <Panel title="Drivers" subtitle="Próximamente"><div className="text-sm text-slate-500">Listado/gestión de conductores.</div></Panel>}
          {tab === "claims"    && <Panel title="Claims" subtitle="Próximamente"><div className="text-sm text-slate-500">Pipeline de siniestros.</div></Panel>}
          {tab === "sim"       && <Panel title="Simulador" subtitle="Próximamente"><div className="text-sm text-slate-500">What-if de pricing/operación.</div></Panel>}
        </main>
      </div>
    </div>
  );
}
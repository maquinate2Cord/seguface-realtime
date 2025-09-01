"use client";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

import ConnectionBadge from "../../components/ConnectionBadge";
import KPICards from "../../components/KPICards";
import HistogramScores from "../../components/HistogramScores";
import TrendChart from "../../components/TrendChart";
import RiskMap from "../../components/RiskMap";
import AlertsPanel from "../../components/AlertsPanel";
import MultiUserChart from "../../components/MultiUserChart";
import ScoreTable from "../../components/ScoreTable";

type Status = "connected" | "connecting" | "disconnected";
type Row = { userId: string; score: number; lastTs: number; events: number };
type Point = { ts: number; avg: number };
type RiskEvt = {
  userId: string;
  ts: number;
  type: "overSpeed" | "hardBrake" | "hardAccel";
  lat: number;
  lng: number;
  severity: number;
};

export default function DashboardPage() {
  const [status, setStatus] = useState<Status>("connecting");
  const [rows, setRows] = useState<Row[]>([]);
  const [series, setSeries] = useState<Point[]>([]);
  const [events, setEvents] = useState<RiskEvt[]>([]);
  const [seriesByUser, setSeriesByUser] = useState<Record<string, { ts: number; score: number }[]>>({});
  const lastRiskByUser = useRef<Record<string, RiskEvt | undefined>>({});
  const buffer = useRef<number[]>([]);
  const limit = 8;

  useEffect(() => {
    const socket = io("http://localhost:4000", { transports: ["websocket"] });

    socket.on("connect", () => setStatus("connected"));
    socket.on("disconnect", () => setStatus("disconnected"));
    socket.on("connect_error", () => setStatus("disconnected"));

    // Estado inicial
    socket.on("bootstrap", (p: { items: Row[] }) => setRows(p.items || []));

    // Actualizaciones de score (lean)
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

    // Eventos de riesgo
    socket.on("risk:event", (payload: { event: RiskEvt }) => {
      setEvents((prev) => [...prev.slice(-499), payload.event]);
      lastRiskByUser.current[payload.event.userId] = payload.event;
    });

    // Promedio móvil cada 3s para TrendChart
    const id = setInterval(() => {
      if (buffer.current.length) {
        const avg = buffer.current.reduce((a, b) => a + b, 0) / buffer.current.length;
        buffer.current = [];
        setSeries((s) => [...s.slice(-200), { ts: Date.now(), avg }]);
      } else {
        setSeries((s) => [...s.slice(-200), { ts: Date.now(), avg: s.at(-1)?.avg ?? 80 }]);
      }
    }, 3000);

    return () => {
      clearInterval(id);
      socket.close();
    };
  }, []);

  // Derivados para KPIs y gráficos
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

      <KPICards
        total={rows.length}
        active={active}
        avgScore={avgScore}
        highRisk={highRisk}
        criticalEvents={criticalEvents}
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <TrendChart series={series} />
        </div>
        <HistogramScores scores={scores} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <MultiUserChart seriesByUser={seriesByUser} limit={limit} />
          <RiskMap events={events} />
        </div>
        <ScoreTable rows={rows} seriesByUser={seriesByUser} lastRiskByUser={lastRiskByUser.current} />
      </section>
    </main>
  );
}

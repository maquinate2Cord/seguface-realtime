"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import io from "socket.io-client";

import TrendChart from "../../../components/TrendChart";
import HistogramScores from "../../../components/HistogramScores";
import RiskMap from "../../../components/RiskMap";

type Row = { userId: string; score: number; lastTs: number; events: number };
type Point = { ts: number; avg: number };
type RiskEvt = { userId: string; ts: number; type: "overSpeed" | "hardBrake" | "hardAccel"; lat: number; lng: number; severity: number };
type Claim = { id: string; userId: string; ts: number; type?: string; severity?: number; amountUsd?: number; status?: string; lat?: number; lng?: number; description?: string };

export default function DriverPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [state, setState] = useState<Row | null>(null);
  const [series, setSeries] = useState<Point[]>([]);
  const [events, setEvents] = useState<RiskEvt[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const buffer = useRef<number[]>([]);

  useEffect(() => {
    // bootstrap
    fetch("http://localhost:4000/scores")
      .then(r => r.json())
      .then(j => {
        const row = (j.items as Row[]).find(x => x.userId === userId);
        if (row) setState(row);
      })
      .catch(() => {});
    fetch("http://localhost:4000/claims?days=180")
      .then(r => r.json())
      .then(j => setClaims(((j.items as Claim[]) || []).filter(c => c.userId === userId)))
      .catch(() => {});

    // realtime
    const socket = io("http://localhost:4000", { transports: ["websocket"] });
    socket.on("score:update", (msg: { state: Row }) => {
      if (msg.state.userId !== userId) return;
      setState(msg.state);
      buffer.current.push(msg.state.score);
    });
    socket.on("risk:event", (payload: { event: RiskEvt }) => {
      if (payload.event.userId !== userId) return;
      setEvents(prev => [...prev.slice(-199), payload.event]);
    });

    const id = setInterval(() => {
      if (buffer.current.length) {
        const avg = buffer.current.reduce((a, b) => a + b, 0) / buffer.current.length;
        buffer.current = [];
        setSeries((s) => [...s.slice(-200), { ts: Date.now(), avg }]);
      }
    }, 3000);

    return () => { clearInterval(id); socket.close(); };
  }, [userId]);

  const back = () => router.push("/dashboard");
  const now = Date.now();
  const active = state ? (now - state.lastTs <= 5 * 60 * 1000) : false;

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={back} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">← Volver</button>
        <h1 className="text-2xl font-bold">Conductor: <span className="font-mono">{userId}</span></h1>
        <div />
      </div>

      <section className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6`}>
        <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          <div className="text-xs text-slate-500">Score</div>
          <div className="text-3xl font-bold">{state?.score?.toFixed(1) ?? "—"}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          <div className="text-xs text-slate-500">Eventos</div>
          <div className="text-3xl font-bold">{state?.events ?? 0}</div>
        </div>
        <div className={`p-4 rounded-xl border ${active ? "border-green-300 bg-green-50" : "border-slate-200 bg-white"} text-slate-800`}>
          <div className="text-xs text-slate-500">Estado</div>
          <div className="text-3xl font-bold">{active ? "Activo" : "Inactivo"}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          <div className="text-xs text-slate-500">Última act.</div>
          <div className="text-3xl font-bold">{state ? Math.max(0, Math.floor((now - state.lastTs)/1000))+"s" : "—"}</div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          <h2 className="font-semibold mb-2">Tendencia</h2>
          <TrendChart series={series} />
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          <h2 className="font-semibold mb-2">Distribución</h2>
          <HistogramScores scores={series.map(p=>p.avg)} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          <h2 className="font-semibold mb-2">Eventos de riesgo</h2>
          <RiskMap events={events} />
          <div className="mt-3 text-xs text-slate-500">Total: {events.length}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          <h2 className="font-semibold mb-2">Claims</h2>
          <div className="text-xs whitespace-pre-wrap">{JSON.stringify(claims, null, 2)}</div>
        </div>
      </section>
    </main>
  );
}
"use client";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import ConnectionBadge from "../../components/ConnectionBadge";
import KPICards from "../../components/KPICards";
import PortfolioCards from "../../components/PortfolioCards";
import RiskBucketsChart from "../../components/RiskBucketsChart";
import CalibrationChart from "../../components/CalibrationChart";
import DriftPanel from "../../components/DriftPanel";
import ReasonCodesPanel from "../../components/ReasonCodesPanel";
import HistogramScores from "../../components/HistogramScores";
import TrendChart from "../../components/TrendChart";
import RiskMap from "../../components/RiskMap";
import AlertsPanel from "../../components/AlertsPanel";
import MultiUserChart from "../../components/MultiUserChart";
import ScoreTable from "../../components/ScoreTable";
import TopRiskTable from "../../components/TopRiskTable";
import ExportButtons from "../../components/ExportButtons";

type Status = "connected" | "connecting" | "disconnected";
type Row = { userId: string; score: number; lastTs: number; events: number };
type Point = { ts: number; avg: number };
type RiskEvt = { userId:string; ts:number; type:"overSpeed"|"hardBrake"|"hardAccel"; lat:number; lng:number; severity:number };
type Buckets = { b0_59:number; b60_74:number; b75_89:number; b90_100:number };
type Metrics = {
  total:number; active:number; avgScore:number; highRisk:number;
  buckets:Buckets; claims30d:number; claimRate:number; avgSeverity:number; avgCost:number; expectedLoss:number;
};

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const WS  = process.env.NEXT_PUBLIC_WS_URL  || "http://localhost:4000";
const HIGH_RISK = Number(process.env.NEXT_PUBLIC_HIGH_RISK ?? 60);

export default function DashboardPage(){
  const [status, setStatus] = useState<Status>("connecting");
  const [rows, setRows] = useState<Row[]>([]);
  const [series, setSeries] = useState<Point[]>([]);
  const [seriesByUser, setSeriesByUser] = useState<Record<string, { ts:number; score:number }[]>>({});
  const [events, setEvents] = useState<RiskEvt[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [calib, setCalib] = useState<{ bucket:string; size:number; rate:number }[]>([]);
  const [drift, setDrift] = useState<{ baseline:{name:string;value:number}[], current:{name:string;value:number}[], psi:number }|null>(null);
  const [reasonsTop, setReasonsTop] = useState<{reason:string;count:number}[]>([]);
  const [limit, setLimit] = useState<number>(25);
  const [onlyHighRisk, setOnlyHighRisk] = useState<boolean>(false);
  const buffer = useRef<number[]>([]);

  useEffect(()=>{
    fetch(`${API}/scores`).then(r=>r.json()).then(d=> setRows((d.items||[]) as Row[]));
    fetch(`${API}/metrics`).then(r=>r.json()).then(d=> setMetrics(d.metrics));
    fetch(`${API}/analytics/calibration`).then(r=>r.json()).then(d=> setCalib(d.calibration||[]));
    fetch(`${API}/analytics/drift`).then(r=>r.json()).then(d=> setDrift(d));
    fetch(`${API}/analytics/reasons-top?minutes=60`).then(r=>r.json()).then(d=> setReasonsTop(d.top||[]));

    const socket = io(WS, { transports: ["websocket"] });
    socket.on("connect", ()=> setStatus("connected"));
    socket.on("disconnect", ()=> setStatus("disconnected"));
    socket.on("connect_error", ()=> setStatus("disconnected"));

    socket.on("bootstrap", (p: { items: Row[] })=> setRows(p.items||[]));
    socket.on("score:update", (msg: { state: Row })=>{
      setRows(prev => { const m=new Map<string, Row>(prev.map(r=>[r.userId,r])); m.set(msg.state.userId, msg.state); return Array.from(m.values()); });
      buffer.current.push(msg.state.score);
      setSeriesByUser(prev => {
        const next = { ...prev };
        const arr = (next[msg.state.userId] || []);
        arr.push({ ts: Date.now(), score: msg.state.score });
        next[msg.state.userId] = arr.slice(-200);
        return next;
      });
    });

    socket.on("risk:event", (payload: { event: RiskEvt })=>{
      setEvents(prev => [...prev.slice(-499), payload.event]);
    });

    const id=setInterval(()=>{
      if(buffer.current.length){
        const avg=buffer.current.reduce((a,b)=>a+b,0)/buffer.current.length;
        buffer.current=[];
        setSeries(s=>[...s.slice(-200), { ts: Date.now(), avg }]);
      }
      // refrescos livianos de analytics
      fetch(`${API}/analytics/calibration`).then(r=>r.json()).then(d=> setCalib(d.calibration||[])).catch(()=>{});
      fetch(`${API}/analytics/drift`).then(r=>r.json()).then(d=> setDrift(d)).catch(()=>{});
      fetch(`${API}/analytics/reasons-top?minutes=60`).then(r=>r.json()).then(d=> setReasonsTop(d.top||[])).catch(()=>{});
    },5000);

    return ()=>{ clearInterval(id); socket.close(); };
  },[]);

  const now = Date.now();
  const filteredRows = onlyHighRisk ? rows.filter(r=> r.score < HIGH_RISK) : rows;
  const active = filteredRows.filter(r => now - r.lastTs <= 5*60*1000).length;
  const avgScore = filteredRows.length ? filteredRows.reduce((a,b)=> a + b.score, 0)/filteredRows.length : 0;
  const highRisk = rows.filter(r=> r.score < HIGH_RISK).length;
  const scores = filteredRows.map(r=> r.score);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Seguface • Insurance Scoring</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-300 flex items-center gap-2">
            <input type="checkbox" checked={onlyHighRisk} onChange={(e)=> setOnlyHighRisk(e.target.checked)} />
            Solo alto riesgo
          </label>
          <div className="text-sm text-slate-300 flex items-center gap-2">
            Mostrar
            <select value={limit} onChange={(e)=> setLimit(Number(e.target.value))} className="bg-black/40 border border-white/10 rounded px-2 py-1">
              <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
            </select>
            usuarios
          </div>
          <ExportButtons />
          <ConnectionBadge status={status} />
        </div>
      </header>

      <KPICards total={filteredRows.length} active={active} avgScore={avgScore} highRisk={highRisk} criticalEvents={events.filter(e=> e.severity>=4).length} />
      {metrics && <PortfolioCards m={metrics} />}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <RiskBucketsChart buckets={metrics?.buckets || { b0_59:0, b60_74:0, b75_89:0, b90_100:0 }} />
        <CalibrationChart data={calib} />
        {drift ? <DriftPanel baseline={drift.baseline} current={drift.current} psi={drift.psi} /> : <div className="card p-4 h-80">Cargando…</div>}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <TrendChart series={series} />
          <MultiUserChart seriesByUser={seriesByUser} limit={limit} />
          <RiskMap events={events} />
        </div>
        <div className="space-y-4">
          <TopRiskTable rows={rows} limit={10} />
          <ReasonCodesPanel top={reasonsTop} />
        </div>
        <ScoreTable rows={filteredRows} seriesByUser={seriesByUser} lastRiskByUser={{}} />
        <AlertsPanel events={events} />
      </section>
    </main>
  );
}
'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import io from 'socket.io-client';
import ConnectionBadge from '../../components/ConnectionBadge';
import LiveScoreChart from '../../components/LiveScoreChart';
import MultiUserChart from '../../components/MultiUserChart';
import ScoreTable from '../../components/ScoreTable';

type Status = 'connected' | 'connecting' | 'disconnected';
type Row = { userId: string; score: number; lastTs: number; events: number };
type Point = { ts: number; avg: number };

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
const WS  = process.env.NEXT_PUBLIC_WS_URL  || 'http://localhost:4000';

export default function DashboardPage(){
  const [status, setStatus] = useState<Status>('connecting');
  const [rows, setRows] = useState<Row[]>([]);
  const [series, setSeries] = useState<Point[]>([]);
  const [seriesByUser, setSeriesByUser] = useState<Record<string, { ts:number; score:number }[]>>({});
  const [limit, setLimit] = useState<number>(25);
  const buffer = useRef<number[]>([]);

  useEffect(()=>{
    fetch(`${API}/scores`).then(r=>r.json()).then(d=> setRows((d.items||[]) as Row[])).catch(()=>{});
    const socket = io(WS, { transports: ['websocket'] });
    socket.on('connect', ()=> setStatus('connected'));
    socket.on('disconnect', ()=> setStatus('disconnected'));
    socket.on('connect_error', ()=> setStatus('disconnected'));

    socket.on('bootstrap', (p: { items: Row[] })=> setRows(p.items||[]));
    socket.on('score:update', (msg: { state: Row })=>{
      setRows(prev => { const m=new Map<string, Row>(prev.map(r=>[r.userId,r])); m.set(msg.state.userId, msg.state); return Array.from(m.values()); });
      buffer.current.push(msg.state.score);
      setSeriesByUser(prev => {
        const next = { ...prev };
        const arr = (next[msg.state.userId] || []);
        arr.push({ ts: Date.now(), score: msg.state.score });
        next[msg.state.userId] = arr.slice(-120);
        return next;
      });
    });

    const id=setInterval(()=>{
      if(buffer.current.length){
        const avg=buffer.current.reduce((a,b)=>a+b,0)/buffer.current.length;
        buffer.current=[];
        setSeries(s=>[...s.slice(-100), { ts: Date.now(), avg }]);
      } else {
        setSeries(s=>[...s.slice(-100), { ts: Date.now(), avg: s.at(-1)?.avg ?? 80 }]);
      }
    },3000);

    return ()=>{ clearInterval(id); socket.close(); };
  },[]);

  const kpis = useMemo(()=>{
    const total = rows.length;
    const avgScore = rows.length ? rows.reduce((a,b)=> a + b.score, 0)/rows.length : 0;
    const risk = rows.filter(r=> r.score < 60).length;
    return { total, avgScore, risk };
  },[rows]);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Seguface • Realtime Scoring</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-300 flex items-center gap-2">
            Mostrar
            <select value={limit} onChange={(e)=> setLimit(Number(e.target.value))} className="bg-black/40 border border-white/10 rounded px-2 py-1">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            usuarios
          </div>
          <ConnectionBadge status={status} />
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-4"><div className="text-sm text-slate-400">Conductores</div><div className="text-3xl font-bold">{kpis.total}</div></div>
        <div className="card p-4"><div className="text-sm text-slate-400">Score promedio</div><div className="text-3xl font-bold">{kpis.avgScore.toFixed(1)}</div></div>
        <div className="card p-4"><div className="text-sm text-slate-400">Riesgo alto (&lt;60)</div><div className="text-3xl font-bold">{kpis.risk}</div></div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <LiveScoreChart series={series} />
          <MultiUserChart seriesByUser={seriesByUser} limit={limit} />
        </div>
        <ScoreTable rows={rows} />
      </section>
    </main>
  );
}
"use client";
import React from "react";
type State = { userId:string; score:number; lastTs:number; events:number };

export default function DriverProfileCards({ s }:{ s: State }){
  const Card = ({label,value}:{label:string;value:string|number})=>(
    <div className="card p-4"><div className="text-sm text-slate-400">{label}</div><div className="text-2xl font-bold">{value}</div></div>
  );
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <Card label="User" value={s.userId} />
      <Card label="Score" value={s.score.toFixed(1)} />
      <Card label="Eventos" value={s.events} />
      <Card label="Últ. actividad" value={new Date(s.lastTs).toLocaleTimeString()} />
    </section>
  );
}
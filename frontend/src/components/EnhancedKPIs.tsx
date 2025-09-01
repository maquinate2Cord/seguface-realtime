"use client";
import React from "react";
import { Users, ActivitySquare, Gauge, AlertTriangle } from "lucide-react";

export default function EnhancedKPIs({
  total, active, avgScore, highRisk, criticalEvents
}: {
  total: number; active: number; avgScore: number; highRisk: number; criticalEvents: number;
}) {
  const Card = ({icon, label, value, tone}:{icon:React.ReactNode; label:string; value:string; tone:"blue"|"green"|"amber"|"rose"}) => {
    const map:any = {
      blue:  "from-blue-50 to-blue-100/60 border-blue-200 text-blue-900",
      green: "from-emerald-50 to-emerald-100/60 border-emerald-200 text-emerald-900",
      amber: "from-amber-50 to-amber-100/60 border-amber-200 text-amber-900",
      rose:  "from-rose-50 to-rose-100/60 border-rose-200 text-rose-900",
    };
    return (
      <div className={`p-4 rounded-2xl border bg-gradient-to-br ${map[tone]} flex items-center gap-3`}>
        <div className="p-2 rounded-xl bg-white/70 border border-white">{icon}</div>
        <div>
          <div className="text-xs opacity-70">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    );
  };
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card icon={<Users className="w-5 h-5" />} label="Conductores" value={String(total)} tone="blue" />
      <Card icon={<ActivitySquare className="w-5 h-5" />} label="Activos (5m)" value={String(active)} tone="green" />
      <Card icon={<Gauge className="w-5 h-5" />} label="Score promedio" value={avgScore.toFixed(1)} tone="amber" />
      <Card icon={<AlertTriangle className="w-5 h-5" />} label="Riesgo alto (<60)" value={String(highRisk)} tone="rose" />
    </section>
  );
}
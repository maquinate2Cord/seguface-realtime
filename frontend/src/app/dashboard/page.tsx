"use client";

import { useEffect, useState } from "react";
import KPICards from "@/components/KPICards";
import RiskMap from "@/components/RiskMap";
import HistogramScores from "@/components/HistogramScores";
import TrendChart from "@/components/TrendChart";
import ScoreTable from "@/components/ScoreTable";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:4000/dashboard")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error cargando datos del dashboard:", err));
  }, []);

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold">Seguface Dashboard</h1>
        <p className="mt-4">Cargando datos...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Seguface Dashboard</h1>

      {/* KPIs */}
      <div className="mb-8">
        <KPICards metrics={data.metrics} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800 rounded-2xl shadow-xl p-4">
          <h2 className="text-lg font-semibold mb-2">Tendencia de Siniestros</h2>
          <TrendChart data={data.trend} />
        </div>

        <div className="bg-slate-800 rounded-2xl shadow-xl p-4">
          <h2 className="text-lg font-semibold mb-2">Distribución de Scores</h2>
          <HistogramScores data={data.distribution} />
        </div>

        <div className="bg-slate-800 rounded-2xl shadow-xl p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Mapa de Riesgos</h2>
          <RiskMap scores={data.scores} />
        </div>
      </div>

      {/* Tabla de scores */}
      <div className="bg-slate-800 rounded-2xl shadow-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Detalle de Vehículos</h2>
        <ScoreTable scores={data.scores} />
      </div>
    </main>
  );
}

"use client";

interface KPICardsProps {
  metrics: {
    avgScore?: number;
    riskEvents?: number;
    activeVehicles?: number;
    reductionPercent?: number;
  };
}

function Card({ label, value }: { label: string; value: number | string | undefined }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 shadow-md">
      <p className="text-gray-400 text-sm">{label}</p>
      <h2 className="text-xl font-bold">{value ?? "-"}</h2>
    </div>
  );
}

export default function KPICards({ metrics }: KPICardsProps) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card label="Vehículos Activos" value={metrics.activeVehicles} />
      <Card label="Eventos de Riesgo" value={metrics.riskEvents} />
      <Card
        label="Score Promedio"
        value={metrics.avgScore !== undefined ? metrics.avgScore.toFixed(1) : "-"}
      />
      <Card label="% Reducción" value={metrics.reductionPercent} />
    </section>
  );
}

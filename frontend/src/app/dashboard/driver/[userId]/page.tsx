"use client";
import React from "react";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const raw = (params as any)?.userId;
  const userId = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "unknown";
  return (
    <main className="min-h-screen p-6 md:p-10">
      <h1 className="text-2xl font-bold mb-4">Conductor: <span className="font-mono">{userId}</span></h1>
      <a href="/dashboard" className="text-blue-600 underline">← Volver al dashboard</a>
      <div className="mt-6 text-slate-500 text-sm">Página de detalle mínima funcionando. Luego reponemos gráficos.</div>
    </main>
  );
}
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import DriverProfileCards from "../../../components/DriverProfileCards";
import DriverTrend from "../../../components/DriverTrend";
import DriverReasons from "../../../components/DriverReasons";
import DriverEvents from "../../../components/DriverEvents";
import DriverClaims from "../../../components/DriverClaims";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const KEY = process.env.NEXT_PUBLIC_DASH_KEY || "";

export default function DriverPage({ params }:{ params:{ userId:string }}){
  const { userId } = params;
  const [data, setData] = useState<any>(null);

  useEffect(()=> {
    fetch(`${API}/driver/${userId}`, { headers: KEY ? { "X-DASH-KEY": KEY } : {} })
      .then(r=> r.ok ? r.json() : Promise.reject(r.status))
      .then(setData)
      .catch(()=> setData({ error:true }));
  }, [userId]);

  if (!data) return <main className="p-6">Cargando…</main>;
  if (data.error) return <main className="p-6">Conductor no encontrado o sin acceso.</main>;

  return (
    <main className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Perfil • {userId}</h1>
        <Link className="btn" href="/dashboard">← Volver</Link>
      </div>

      <DriverProfileCards s={data.state} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2"><DriverTrend data={data.series || []} /></div>
        <DriverReasons reasons={data.reasons || []} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DriverEvents events={data.events || []} />
        <DriverClaims claims={data.claims || []} />
      </section>
    </main>
  );
}
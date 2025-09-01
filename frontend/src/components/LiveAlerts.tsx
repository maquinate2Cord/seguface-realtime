"use client";
import React, { useEffect, useState } from "react";

type Alert = {
  id: string; userId: string; ts: number;
  type: "overSpeed" | "hardBrake" | "hardAccel";
  lat?: number; lng?: number; severity: number; acked: boolean; createdAt: number;
};

export default function LiveAlerts() {
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("http://localhost:4000/alerts/recent?minutes=15");
      const j = await r.json();
      setItems(j.items ?? []);
    } catch {}
    setLoading(false);
  };

  const ack = async (id: string) => {
    try {
      await fetch("http://localhost:4000/alerts/ack", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setItems(prev => prev.map(a => a.id===id? { ...a, acked: true }: a));
    } catch {}
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const rel = (t:number) => {
    const d = Math.max(0, Date.now() - t);
    const m = Math.floor(d/60000);
    if (m < 1) return "ahora";
    if (m < 60) return m+" min";
    const h = Math.floor(m/60);
    return h+" h";
  };

  return (
    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-slate-800">
      <div className="mb-2 font-semibold flex items-center gap-2">Alertas (15 min) {loading && <span className="text-xs text-slate-500">…</span>}</div>
      <div className="flex flex-col gap-2">
        {items.length===0 && <div className="text-sm text-slate-500">Sin alertas recientes</div>}
        {items.map(a=>(
          <div key={a.id} className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
            <div className="text-sm">
              <span className="font-mono">{a.userId}</span> · <b>{a.type}</b> · sev {a.severity} · {rel(a.createdAt)}
            </div>
            <button
              disabled={a.acked}
              onClick={()=>ack(a.id)}
              className={`px-2 py-1 rounded-md border ${a.acked ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-white hover:bg-slate-50 border-slate-300"}`}
            >
              {a.acked ? "ACK" : "Acknowledge"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
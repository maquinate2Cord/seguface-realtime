"use client";
import React, { useEffect, useState } from "react";

type SimConfig = {
  targetScore: number;
  kPull: number;
  noiseStd: number;
  maxDeltaUp: number;
  maxDeltaDown: number;
  coolDownMs: number;
  prob: { overSpeed: number; hardBrake: number; hardAccel: number };
};

const API = "http://localhost:4000";

export default function SimConfigPanel() {
  const [cfg, setCfg] = useState<SimConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(API + "/sim-config")
      .then((r) => r.json())
      .then((j) => setCfg(j.config))
      .catch(() => setMsg("No pude cargar /sim-config"));
  }, []);

  const patch = async (partial: Partial<SimConfig>) => {
    if (!cfg) return;
    setSaving(true);
    try {
      const res = await fetch(API + "/sim-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const j = await res.json();
      setCfg(j.config);
      setMsg("Guardado ✔");
    } catch {
      setMsg("Error al guardar");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 1500);
    }
  };

  const reset = async () => {
    setSaving(true);
    try {
      const res = await fetch(API + "/sim-config/reset", { method: "POST" });
      const j = await res.json();
      setCfg(j.config);
      setMsg("Reseteado ✔");
    } catch {
      setMsg("Error al resetear");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 1500);
    }
  };

  if (!cfg) return <div className="text-sm text-slate-500">Cargando configuración…</div>;

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      {children}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={reset}
          className="px-3 py-2 rounded-md bg-slate-900 text-white border border-slate-700"
          disabled={saving}
        >
          Reset
        </button>
        {msg && <span className="text-xs text-slate-500">{msg}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          <h3 className="font-semibold mb-3">Core</h3>

          <Row label={`Target Score: ${cfg.targetScore}`}>
            <input
              type="range" min={0} max={100} step={1} value={cfg.targetScore}
              onChange={(e) => setCfg({ ...cfg, targetScore: Number(e.target.value) })}
              onMouseUp={() => patch({ targetScore: cfg.targetScore })}
              onTouchEnd={() => patch({ targetScore: cfg.targetScore })}
              className="w-full"
            />
          </Row>

          <Row label={`kPull (reversión): ${cfg.kPull.toFixed(3)}`}>
            <input
              type="range" min={0} max={0.2} step={0.005} value={cfg.kPull}
              onChange={(e) => setCfg({ ...cfg, kPull: Number(e.target.value) })}
              onMouseUp={() => patch({ kPull: cfg.kPull })}
              onTouchEnd={() => patch({ kPull: cfg.kPull })}
              className="w-full"
            />
          </Row>

          <Row label={`Ruido (σ): ${cfg.noiseStd.toFixed(2)}`}>
            <input
              type="range" min={0} max={2} step={0.05} value={cfg.noiseStd}
              onChange={(e) => setCfg({ ...cfg, noiseStd: Number(e.target.value) })}
              onMouseUp={() => patch({ noiseStd: cfg.noiseStd })}
              onTouchEnd={() => patch({ noiseStd: cfg.noiseStd })}
              className="w-full"
            />
          </Row>

          <Row label={`Máx Δ Up: ${cfg.maxDeltaUp.toFixed(2)}`}>
            <input
              type="range" min={0} max={2} step={0.05} value={cfg.maxDeltaUp}
              onChange={(e) => setCfg({ ...cfg, maxDeltaUp: Number(e.target.value) })}
              onMouseUp={() => patch({ maxDeltaUp: cfg.maxDeltaUp })}
              onTouchEnd={() => patch({ maxDeltaUp: cfg.maxDeltaUp })}
              className="w-full"
            />
          </Row>

          <Row label={`Máx Δ Down: ${cfg.maxDeltaDown.toFixed(2)}`}>
            <input
              type="range" min={-5} max={0} step={0.05} value={cfg.maxDeltaDown}
              onChange={(e) => setCfg({ ...cfg, maxDeltaDown: Number(e.target.value) })}
              onMouseUp={() => patch({ maxDeltaDown: cfg.maxDeltaDown })}
              onTouchEnd={() => patch({ maxDeltaDown: cfg.maxDeltaDown })}
              className="w-full"
            />
          </Row>

          <Row label={`CoolDown (ms): ${cfg.coolDownMs}`}>
            <input
              type="range" min={0} max={300000} step={1000} value={cfg.coolDownMs}
              onChange={(e) => setCfg({ ...cfg, coolDownMs: Number(e.target.value) })}
              onMouseUp={() => patch({ coolDownMs: cfg.coolDownMs })}
              onTouchEnd={() => patch({ coolDownMs: cfg.coolDownMs })}
              className="w-full"
            />
          </Row>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800">
          <h3 className="font-semibold mb-3">Probabilidades de eventos</h3>

          <Row label={`OverSpeed: ${cfg.prob.overSpeed.toFixed(2)}`}>
            <input
              type="range" min={0} max={1} step={0.01} value={cfg.prob.overSpeed}
              onChange={(e) => setCfg({ ...cfg, prob: { ...cfg.prob, overSpeed: Number(e.target.value) } })}
              onMouseUp={() => patch({ prob: { overSpeed: cfg.prob.overSpeed } as any })}
              onTouchEnd={() => patch({ prob: { overSpeed: cfg.prob.overSpeed } as any })}
              className="w-full"
            />
          </Row>

          <Row label={`HardBrake: ${cfg.prob.hardBrake.toFixed(2)}`}>
            <input
              type="range" min={0} max={1} step={0.01} value={cfg.prob.hardBrake}
              onChange={(e) => setCfg({ ...cfg, prob: { ...cfg.prob, hardBrake: Number(e.target.value) } })}
              onMouseUp={() => patch({ prob: { hardBrake: cfg.prob.hardBrake } as any })}
              onTouchEnd={() => patch({ prob: { hardBrake: cfg.prob.hardBrake } as any })}
              className="w-full"
            />
          </Row>

          <Row label={`HardAccel: ${cfg.prob.hardAccel.toFixed(2)}`}>
            <input
              type="range" min={0} max={1} step={0.01} value={cfg.prob.hardAccel}
              onChange={(e) => setCfg({ ...cfg, prob: { ...cfg.prob, hardAccel: Number(e.target.value) } })}
              onMouseUp={() => patch({ prob: { hardAccel: cfg.prob.hardAccel } as any })}
              onTouchEnd={() => patch({ prob: { hardAccel: cfg.prob.hardAccel } as any })}
              className="w-full"
            />
          </Row>
        </div>
      </div>
    </div>
  );
}

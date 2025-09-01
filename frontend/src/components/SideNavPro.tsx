"use client";
import React from "react";
import { Gauge, Activity, Users, FileText, Boxes, Cpu } from "lucide-react";

export type TabKey = "realtime" | "portfolio" | "drivers" | "claims" | "model" | "sim";

const items: { key: TabKey; label: string; Icon: any }[] = [
  { key: "realtime",  label: "Realtime",  Icon: Activity },
  { key: "portfolio", label: "Portfolio", Icon: Gauge },
  { key: "drivers",   label: "Drivers",   Icon: Users },
  { key: "claims",    label: "Claims",    Icon: FileText },
  { key: "model",     label: "Model",     Icon: Cpu },
  { key: "sim",       label: "Sim",       Icon: Boxes },
];

export default function SideNavPro({
  value, onChange
}:{ value: TabKey; onChange:(k:TabKey)=>void }) {
  return (
    <aside className="hidden md:block w-[240px] shrink-0">
      <div className="sticky top-4 rounded-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white px-4 py-3 text-sm font-semibold">Menú</div>
        <nav className="bg-white p-2">
          {items.map(({key,label,Icon})=>{
            const active = key===value;
            return (
              <button key={key}
                onClick={()=>onChange(key)}
                className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 transition border mb-1
                ${active ? "bg-slate-900 text-white border-slate-900"
                         : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"}`}>
                <Icon size={16} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
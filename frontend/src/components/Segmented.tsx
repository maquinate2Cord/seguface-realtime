"use client";
import React from "react";

type Opt = { value: string; label: string; icon?: React.ReactNode };
export default function Segmented({
  options, value, onChange, className = ""
}: {
  options: Opt[]; value: string; onChange: (v:string)=>void; className?: string;
}) {
  return (
    <div className={`inline-flex rounded-xl border border-slate-300 bg-slate-100 p-1 ${className}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition
              ${active ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:bg-white/60"}`}
            aria-pressed={active}
          >
            {o.icon}{o.label}
          </button>
        );
      })}
    </div>
  );
}
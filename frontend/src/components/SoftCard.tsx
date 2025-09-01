"use client";
import React from "react";

export default function SoftCard({
  title, subtitle, right, className="", children
}:{
  title: string; subtitle?: string; right?: React.ReactNode;
  className?: string; children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white ${className}`}>
      <header className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-end justify-between">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle ? <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div> : null}
        </div>
        {right}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
"use client";
import React from "react";

export default function WidgetCard({
  title, subtitle, right, className="", children
}:{
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
        </div>
        {right ? <div className="flex items-center gap-2">{right}</div> : null}
      </div>
      <div className="min-h-[160px]">{children}</div>
    </div>
  );
}
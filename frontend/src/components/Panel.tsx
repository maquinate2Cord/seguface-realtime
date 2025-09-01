"use client";
import React from "react";

export default function Panel({
  title, subtitle, actions, className="", children
}:{
  title:string; subtitle?:string; actions?:React.ReactNode; className?:string; children:React.ReactNode;
}){
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white ${className}`}>
      <header className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-end justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          {subtitle ? <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>
      <div className="p-4">
        {children}
      </div>
    </section>
  );
}
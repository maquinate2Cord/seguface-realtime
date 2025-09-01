"use client";
import React from "react";

export default function Section({
  title, subtitle, actions, children, className=""
}:{
  title:string; subtitle?:string; actions?:React.ReactNode; children:React.ReactNode; className?:string;
}){
  return (
    <section className={`mb-6 ${className}`}>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-800">{title}</h2>
          {subtitle ? <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
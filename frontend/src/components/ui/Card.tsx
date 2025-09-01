"use client";
import React from "react";

export function Card({ children, className="" }: { children:React.ReactNode; className?:string }){
  return <div className={`p-4 rounded-2xl border border-slate-200 bg-white ${className}`}>{children}</div>;
}
export function CardHeader({ title, desc }: { title:string; desc?:string }){
  return (
    <div className="mb-3">
      <div className="font-semibold">{title}</div>
      {desc ? <div className="text-sm text-slate-500">{desc}</div> : null}
    </div>
  );
}
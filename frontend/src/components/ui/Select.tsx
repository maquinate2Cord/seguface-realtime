"use client";
import React from "react";
import { twMerge } from "tailwind-merge";

export default function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>){
  const base = "px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300";
  return (
    <div className="relative inline-block">
      <select className={twMerge(base, className)} {...rest}>{children}</select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
    </div>
  );
}
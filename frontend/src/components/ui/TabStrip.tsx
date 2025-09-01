"use client";
import React from "react";

export default function TabStrip({
  value, onChange, options
}:{
  value:string; onChange:(v:string)=>void;
  options:{ value:string; label:string; icon?:React.ReactNode }[];
}){
  return (
    <div className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-1">
      {options.map((o)=>(
        <button key={o.value} onClick={()=>onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition
            ${value===o.value ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:bg-white/60"}`}>
          {o.icon}{o.label}
        </button>
      ))}
    </div>
  );
}
"use client";
import React from "react";

export default function Switch({ checked, onChange }: { checked:boolean; onChange:(v:boolean)=>void }){
  return (
    <button
      onClick={()=>onChange(!checked)}
      className={`w-10 h-6 rounded-full border transition relative ${checked ? "bg-emerald-500 border-emerald-500" : "bg-slate-200 border-slate-300"}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transform transition ${checked ? "left-4" : "left-0.5"}`} />
    </button>
  );
}
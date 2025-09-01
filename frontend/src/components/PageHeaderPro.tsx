"use client";
import React from "react";

export default function PageHeaderPro({
  title, status
}:{ title:string; status?: "Conectado"|"Desconectado" }){
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {status && (
        <span className={`text-xs px-2.5 py-1 rounded-full border ${status==="Conectado" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
          {status}
        </span>
      )}
    </div>
  );
}
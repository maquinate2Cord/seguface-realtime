"use client";
import React from "react";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function ExportButtons(){
  return (
    <div className="flex gap-2">
      <a className="btn" href={`${API}/export/scores.csv`}>Exportar Scores (CSV)</a>
      <a className="btn" href={`${API}/export/claims.csv`}>Exportar Siniestros (CSV)</a>
    </div>
  );
}
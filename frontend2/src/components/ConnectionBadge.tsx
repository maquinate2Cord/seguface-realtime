'use client';
import React from 'react';
type Status = 'connected'|'connecting'|'disconnected';
export default function ConnectionBadge({ status }: { status: Status }){
  const color = status==='connected' ? 'bg-emerald-500' : status==='connecting' ? 'bg-amber-500' : 'bg-rose-500';
  const text  = status==='connected' ? 'Conectado' : status==='connecting' ? 'Conectando…' : 'Desconectado';
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${color} text-black`}>
      {text}
      <span className="w-2 h-2 rounded-full bg-black/40"/>
    </span>
  );
}
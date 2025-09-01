"use client";
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Buckets = { b0_59:number; b60_74:number; b75_89:number; b90_100:number };

export default function RiskBucketsChart({ buckets }:{ buckets:Buckets }){
  const data = useMemo(()=>[
    { bucket: "0-59",  count: buckets.b0_59   },
    { bucket: "60-74", count: buckets.b60_74  },
    { bucket: "75-89", count: buckets.b75_89  },
    { bucket: "90-100",count: buckets.b90_100 },
  ], [buckets]);
  return (
    <div className="card p-4 h-80">
      <h3 className="text-lg font-semibold mb-2">Distribución por riesgo</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="bucket" stroke="#94a3b8"/>
          <YAxis stroke="#94a3b8"/>
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
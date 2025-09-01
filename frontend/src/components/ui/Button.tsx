"use client";
import React from "react";
import { twMerge } from "tailwind-merge";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary"|"secondary"|"ghost";
  size?: "sm"|"md";
};
export default function Button({ className, variant="primary", size="md", ...rest }: Props){
  const base = "inline-flex items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50";
  const v = variant==="primary"
    ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
    : variant==="secondary"
    ? "bg-white text-slate-900 border-slate-300 hover:bg-slate-50"
    : "bg-transparent text-slate-700 border-transparent hover:bg-slate-100";
  const s = size==="sm" ? "px-2.5 py-1.5 text-sm" : "px-3.5 py-2 text-sm";
  return <button className={twMerge(base, v, s, className)} {...rest} />;
}
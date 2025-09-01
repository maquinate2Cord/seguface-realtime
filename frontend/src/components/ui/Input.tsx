"use client";
import React from "react";
import { twMerge } from "tailwind-merge";

export default function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>){
  const base = "w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300";
  return <input className={twMerge(base, className)} {...rest} />;
}
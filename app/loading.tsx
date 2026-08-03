import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-neutral-950 select-none font-sans p-6">
      <div className="flex flex-col items-center gap-5">
        <div className="font-serif text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Vita<span className="text-teal-600">Mend</span>
        </div>
        <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-neutral-800 border-t-teal-600 animate-spin" />
        <p className="font-sans text-slate-500 text-sm mt-2 animate-pulse">Loading…</p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Building2, CheckCircle2, Clock, Leaf, Package, ShieldCheck, TrendingUp, XCircle } from "lucide-react";
import type { TransparencyMetrics } from "@/types/transparency";

interface Props { initialMetrics: TransparencyMetrics }

export function TransparencyDashboard({ initialMetrics }: Props) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (active) setIsRefreshing(true);
      try {
        const response = await fetch("/api/transparency", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error("metrics unavailable");
        if (active) { setMetrics(data.metrics); setError(false); }
      } catch { if (active) setError(true); }
      finally { if (active) setIsRefreshing(false); }
    };
    const interval = window.setInterval(refresh, 15000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const cards = [
    { label: "Medicines Collected", value: metrics.totalCollected.toLocaleString(), sub: "Actual intake units", icon: Package },
    { label: "Medicines Verified", value: metrics.totalVerified.toLocaleString(), sub: "Approved or distributed", icon: CheckCircle2, color: "text-emerald-700" },
    { label: "Medicines Rejected", value: metrics.totalRejected.toLocaleString(), sub: "Rejected or disposed", icon: XCircle, color: "text-red-600" },
    { label: "Medicines Distributed", value: metrics.totalDistributed.toLocaleString(), sub: "Delivered to clinics", icon: TrendingUp },
    { label: "Lives Impacted", value: metrics.livesImpacted.toLocaleString(), sub: "Tracked treatment data", icon: ShieldCheck },
    { label: "Partner Clinics", value: metrics.partnerClinics.toLocaleString(), sub: "Registered organizations", icon: Building2 },
    { label: "Volunteer Hours", value: metrics.volunteerHours.toLocaleString(), sub: "Tracked service hours", icon: Clock },
    { label: "CO₂ Saved (Kg)", value: `${metrics.co2SavedKg.toLocaleString()} kg`, sub: "Tracked environmental data", icon: Leaf, color: "text-teal-700" },
  ];

  return <>
    <div className="mb-4 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#3E492B]/60"><Activity className={`h-3.5 w-3.5 ${isRefreshing ? "animate-pulse" : ""}`} /> Live from MongoDB · Updated {new Date(metrics.lastUpdated).toLocaleTimeString("en-IN")}</div>
    {error && <div className="mb-4 flex items-center justify-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><AlertTriangle className="h-4 w-4" /> Live refresh unavailable; showing the last verified snapshot.</div>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => { const Icon = card.icon; return <div key={card.label} className="flex min-h-[130px] flex-col justify-between rounded-md border border-[#DDD8CF] bg-white p-5"><div className="flex items-center justify-between"><span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#3E492B]/70">{card.label}</span><Icon className={`h-4 w-4 ${card.color || "text-[#3E492B]"}`} /></div><div><p className="mt-2 text-3xl font-serif font-medium text-[#3E492B]">{card.value}</p><p className="mt-1 text-[10px] font-mono text-[#3E492B]/60">{card.sub}</p></div></div>; })}
    </div>
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 rounded-lg border border-[#DDD8CF] bg-white p-8 lg:col-span-2"><div className="flex items-center justify-between border-b border-[#DDD8CF] pb-4"><div><span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">Monthly volume trends</span><h2 className="mt-1 text-2xl font-serif font-medium text-[#3E492B]">Redistribution activity stream</h2></div><span className="rounded border border-[#DDD8CF] bg-[#F5F2EC] px-2.5 py-1 text-[10px] font-mono">{new Date(metrics.lastUpdated).getFullYear()} YTD</span></div>{metrics.months.map((month) => <div key={month.month} className="space-y-1.5 text-xs"><div className="flex justify-between gap-4 font-medium"><span className="font-serif text-sm text-[#3E492B]">{month.month}</span><span className="text-right font-mono text-[#3E492B]/80">{month.distributed} delivered / {month.collected} collected ({month.pct}%)</span></div><div className="h-2 overflow-hidden rounded-full border border-[#DDD8CF] bg-[#F5F2EC]"><div className="h-full rounded-full bg-[#3E492B]" style={{ width: `${month.pct}%` }} /></div></div>)}</div>
      <div className="flex flex-col justify-between space-y-5 rounded-lg border border-[#DDD8CF] bg-white p-8"><div className="space-y-3"><span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">Geographic reach</span><h3 className="text-xl font-serif font-medium text-[#3E492B]">Clinic distribution map</h3><p className="text-xs leading-relaxed text-[#3E492B]/80">Locations will appear here once delivered distributions include recipient clinic records.</p></div><div className="flex h-44 flex-col items-center justify-center space-y-2 rounded-md border border-[#DDD8CF] bg-[#F5F2EC] p-4 text-center text-xs text-[#3E492B]/70"><Building2 className="h-8 w-8 text-[#3E492B]/40" /><span className="font-serif text-sm font-medium text-[#3E492B]">{metrics.totalDistributed ? "Distribution locations recorded" : "No distributions recorded"}</span><span className="font-mono text-[10px]">{metrics.partnerClinics} REGISTERED CLINICS</span></div></div>
    </div>
  </>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, ArrowRight } from "lucide-react";
import { TransparencyDashboard } from "@/components/transparency-dashboard";
import { getTransparencyMetrics } from "@/lib/transparency";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Public Transparency Ledger & Impact Dashboard",
  description: "Live medicine collection, verification, and distribution data sourced from the VitaMend database.",
};

export default async function TransparencyPage() {
  let metrics;
  try {
    metrics = await getTransparencyMetrics();
  } catch {
    metrics = null;
  }

  return <div className="min-h-screen bg-[#F5F2EC] px-4 pb-16 pt-24 font-sans text-[#3E492B] sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl space-y-12">
      <div className="mx-auto max-w-4xl space-y-4 rounded-lg border border-[#DDD8CF] bg-white p-8 text-center sm:p-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#3E492B]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider"><BarChart3 className="h-4 w-4" /> Open transparency ledger</div>
        <h1 className="font-serif text-3xl font-medium tracking-tight sm:text-5xl">Real-Time Public Transparency Dashboard</h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#3E492B]/80 sm:text-lg">Recorded collection and delivery totals come from the database. Untracked outcomes are unavailable, not zero. These records are not a cryptographically verified ledger.</p>
      </div>

      {metrics ? <TransparencyDashboard initialMetrics={metrics} /> : <p role="alert">Transparency data is currently unavailable. Please reload to retry; no zero-value snapshot has been substituted.</p>}

      <div className="space-y-6 rounded-lg border border-[#DDD8CF] bg-[#3E492B] p-8 text-center text-white sm:p-12">
        <h2 className="font-serif text-3xl font-medium sm:text-4xl">Verify medicine records on the store</h2>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">View live, verified available stock cleared for clinic redistribution.</p>
        <div className="flex justify-center pt-2"><Link href="/store" className="btn-primary flex items-center gap-2 bg-white px-6 py-3 text-xs text-[#3E492B] hover:bg-white/90">View public store inventory <ArrowRight className="h-4 w-4" /></Link></div>
      </div>
    </div>
  </div>;
}

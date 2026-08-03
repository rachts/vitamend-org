"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Package, Heart, Leaf, Droplets, Activity } from "lucide-react"

interface TrendData {
  label: string;
  count: number;
  approved: number;
  rejected: number;
}

interface AnalyticsData {
  donations: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    distributed: number;
    successRate: number;
  };
  inventory: {
    totalItems: number;
    totalStock: number;
    expiringSoon: number;
  };
  distributions: {
    total: number;
    delivered: number;
    pending: number;
    inTransit: number;
    byType: { _id: string; count: number; totalQuantity: number }[];
    totalDeliveredQty: number;
  };
  impact: {
    medicinesSaved: number;
    estimatedLivesImpacted: number;
    co2SavedKg: number;
    waterSavedLiters: number;
  };
  trends: TrendData[];
  aiPerformance: {
    totalVerifications: number;
    autoApproved: number;
    autoRejected: number;
    manualReview: number;
    avgConfidence: number;
    accuracy: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(setData).catch(console.error)
  }, [])

  if (!data) {
    return <div className="min-h-screen bg-[var(--bg-main)] noise-bg flex items-center justify-center font-serif text-2xl text-[var(--text-muted)]">Loading metrics...</div>
  }

  const { donations, inventory, impact, trends, aiPerformance } = data

  const maxTrend = Math.max(...trends.map((t: TrendData) => t.count), 1)

  return (
    <div className="min-h-screen bg-[var(--bg-main)] noise-bg py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-4xl font-serif text-[var(--text-primary)]">Platform Analytics</h1>
          <p className="text-[var(--text-secondary)] font-sans mt-2">Real-time impact and performance metrics.</p>
        </header>

        {/* Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Medicines Saved", val: impact.medicinesSaved, icon: <Package className="w-6 h-6 text-[#4A7C9B]" />, bg: "bg-[#4A7C9B]/10" },
            { label: "Est. Lives Impacted", val: impact.estimatedLivesImpacted, icon: <Heart className="w-6 h-6 text-[#C45A5A]" />, bg: "bg-[#C45A5A]/10" },
            { label: "CO₂ Emissions Saved", val: `${impact.co2SavedKg} kg`, icon: <Leaf className="w-6 h-6 text-[#5B8A72]" />, bg: "bg-[#5B8A72]/10" },
            { label: "Water Saved", val: `${impact.waterSavedLiters} L`, icon: <Droplets className="w-6 h-6 text-blue-500" />, bg: "bg-blue-500/10" }
          ].map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-[#ddd8cf] shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-full ${card.bg}`}>{card.icon}</div>
              <div>
                <p className="text-2xl font-serif text-[var(--text-primary)] animate-[countUp_1s_ease-out]">{card.val}</p>
                <p className="text-xs text-[var(--text-secondary)] font-sans uppercase tracking-wider">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Donation Pipeline */}
          <div className="bg-white p-6 rounded-xl border border-[#ddd8cf] shadow-sm">
            <h3 className="font-serif text-xl text-[var(--text-primary)] mb-4">Donation Pipeline</h3>
            <div className="space-y-4 font-sans text-sm">
              <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)]">Total Processed</span><span className="font-bold">{donations.total}</span></div>
              <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)]">Pending/Review</span><span className="font-bold text-orange-600">{donations.pending}</span></div>
              <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)]">Approved (Safe)</span><span className="font-bold text-[#5B8A72]">{donations.approved}</span></div>
              <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)]">Rejected (Unsafe)</span><span className="font-bold text-[#C45A5A]">{donations.rejected}</span></div>
              <div className="pt-4 border-t border-[#ddd8cf] flex justify-between items-center">
                <span className="font-semibold text-[var(--text-primary)]">Safety Success Rate</span>
                <span className="font-bold text-lg text-[var(--accent-dark)]">{donations.successRate}%</span>
              </div>
            </div>
          </div>

          {/* AI Performance */}
          <div className="bg-white p-6 rounded-xl border border-[#ddd8cf] shadow-sm">
            <h3 className="font-serif text-xl text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--accent-dark)]" /> AI Verification Engine
            </h3>
            <div className="space-y-4 font-sans text-sm">
              <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)]">Total Scans</span><span className="font-bold">{aiPerformance.totalVerifications}</span></div>
              <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)]">Auto-Approved</span><span className="font-bold text-[#5B8A72]">{aiPerformance.autoApproved}</span></div>
              <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)]">Auto-Rejected</span><span className="font-bold text-[#C45A5A]">{aiPerformance.autoRejected}</span></div>
              <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)]">Sent to Manual Review</span><span className="font-bold text-[#4A7C9B]">{aiPerformance.manualReview}</span></div>
              <div className="pt-4 border-t border-[#ddd8cf] flex justify-between items-center">
                <span className="font-semibold text-[var(--text-primary)]">AI Autonomy Rate</span>
                <span className="font-bold text-lg text-[var(--accent-dark)]">{aiPerformance.accuracy}%</span>
              </div>
            </div>
          </div>

          {/* Inventory Status */}
          <div className="bg-white p-6 rounded-xl border border-[#ddd8cf] shadow-sm flex flex-col justify-between">
            <h3 className="font-serif text-xl text-[var(--text-primary)] mb-4">Current Inventory</h3>
            <div className="text-center py-6">
              <p className="text-5xl font-serif text-[var(--text-primary)]">{inventory.totalStock}</p>
              <p className="text-sm text-[var(--text-secondary)] font-sans uppercase tracking-wider mt-2">Total Units Available</p>
            </div>
            <div className="flex justify-between border-t border-[#ddd8cf] pt-4 text-sm font-sans">
              <span className="text-[var(--text-secondary)]">Unique Types: <span className="font-bold text-[var(--text-primary)]">{inventory.totalItems}</span></span>
              <span className="text-[var(--text-secondary)]">Expiring Soon: <span className="font-bold text-[#C45A5A]">{inventory.expiringSoon}</span></span>
            </div>
          </div>

        </div>

        {/* Monthly Trends (CSS Bar Chart) */}
        <div className="bg-white p-6 rounded-xl border border-[#ddd8cf] shadow-sm">
          <h3 className="font-serif text-xl text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--text-secondary)]" /> Monthly Donation Trends
          </h3>
          <div className="h-64 flex items-end justify-between gap-2 border-b border-[#ddd8cf] pb-2 px-4 relative">
            {trends.map((t: TrendData, i: number) => (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <div className="w-full flex justify-center items-end gap-1 mb-2 h-full">
                  <div 
                    className="w-1/3 bg-[#5B8A72] rounded-t-sm transition-all group-hover:opacity-80" 
                    style={{ height: `${Math.max((t.approved / maxTrend) * 100, 2)}%` }}
                    title={`Approved: ${t.approved}`}
                  ></div>
                  <div 
                    className="w-1/3 bg-[#C45A5A] rounded-t-sm transition-all group-hover:opacity-80" 
                    style={{ height: `${Math.max((t.rejected / maxTrend) * 100, 2)}%` }}
                    title={`Rejected: ${t.rejected}`}
                  ></div>
                </div>
                <span className="text-xs text-[var(--text-secondary)] font-sans">{t.label}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs font-sans text-[var(--text-secondary)] uppercase tracking-wider">
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#5B8A72] rounded-full"></span> Approved</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#C45A5A] rounded-full"></span> Rejected</span>
          </div>
        </div>

      </div>
    </div>
  )
}

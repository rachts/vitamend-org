"use client";

import { useState } from "react";
import { Download, UserPlus, Activity, BarChart3, Shield, Users, AlertCircle } from "lucide-react";

export default function PlatformPage() {
  const [auditLogs] = useState<unknown[]>([]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#DDD8CF]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#3E492B]/70 mb-1">
            <span>System Operations</span>
            <span>/</span>
            <span className="text-[#3E492B]">Platform Administration</span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#3E492B] tracking-tight">
            Admin & Volunteer Governance Console
          </h1>
          <p className="text-[#3E492B]/80 text-sm mt-1">
            Monitor platform infrastructure health, automated label verification streams, and verifier permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Export Audit Logs
          </button>
          <button className="btn-primary flex items-center gap-2 text-xs">
            <UserPlus className="w-3.5 h-3.5" /> Invite Volunteer Verifier
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "System Uptime", badge: "STANDBY", value: "—", status: "Services initializing", icon: Shield, color: "text-[var(--text-muted)]", bg: "bg-[var(--bg-secondary)]" },
          { title: "Label OCR Throughput", badge: "STANDBY", value: "0 scans/s", status: "Scanner standing by", sub: "Ready", icon: BarChart3, color: "text-[#3E492B]/70", bg: "bg-[#F5F2EC]" },
          { title: "Volunteer Verifiers", badge: "ROSTER", value: "0", status: "Invite verifiers to begin", icon: Users, color: "text-[#3E492B]/70", bg: "bg-[#F5F2EC]" },
          { title: "Safety Review Queue", badge: "CLEAR", value: "0 lots", status: "Queue clear", sub: "QUEUE_0", icon: AlertCircle, color: "text-[#3E492B]/70", bg: "bg-[#F5F2EC]" },
        ].map((kpi) => (
          <div key={kpi.title} className="rounded-xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-5 flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#3E492B]/70">{kpi.title}</span>
              <span className="text-[10px] font-mono bg-[#F5F2EC] text-[#3E492B]/70 px-2 py-0.5 rounded border border-[#DDD8CF]">{kpi.badge}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mt-2">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                <p className="text-2xl font-serif font-medium text-[#3E492B]">{kpi.value}</p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#DDD8CF]/60">
                <span className="text-xs text-[#3E492B]/80">{kpi.status}</span>
                {kpi.sub && <span className="text-[10px] font-mono text-[#3E492B]/70">{kpi.sub}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Table */}
      <div className="rounded-xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-serif font-medium text-[#3E492B]">System Activity Log & Governance Registry</h2>
            <p className="text-xs text-[#3E492B]/70 mt-0.5">Real-time transaction record of medicine label scans and verification sign-offs</p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> STATUS: LISTENING
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="py-16 text-center">
            <Activity className="w-10 h-10 mx-auto mb-3 text-[#3E492B]/40" />
            <p className="text-sm font-medium text-[#3E492B]">Listening for activity</p>
            <p className="text-xs text-[#3E492B]/70 mt-1 max-w-md mx-auto">
              Medicine scans, pharmacist sign-offs, and routing events will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#DDD8CF] text-[#3E492B]/70 text-xs uppercase tracking-wider">
                <tr>
                  <th className="pb-3 font-medium">Log Serial</th>
                  <th className="pb-3 font-medium">Event Description</th>
                  <th className="pb-3 font-medium">Associated Entity</th>
                  <th className="pb-3 font-medium">Timestamp</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD8CF]/60" />
            </table>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-[#DDD8CF]/60 flex items-center justify-between text-[11px] text-[#3E492B]/70">
          <span>Security logs authenticated by core platform monitoring service</span>
          <span className="font-mono">SYSTEM: READY</span>
        </div>
      </div>
    </div>
  );
}

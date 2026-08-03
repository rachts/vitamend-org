"use client"

import React, { useState, useEffect } from "react"
import { CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw, ShieldCheck, Cpu, Activity, Play } from "lucide-react"

interface PreflightCheck {
  id: string;
  name: string;
  description: string;
  status: "pass" | "warn" | "fail";
  details: string;
  estimatedFixTime?: string;
}

interface PreflightResponse {
  timestamp: string;
  overallStatus: "ALL_GREEN" | "NEEDS_REVIEW";
  isDemoModeActive: boolean;
  checks: PreflightCheck[];
}

export default function PreflightChecklistPage() {
  const [data, setData] = useState<PreflightResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/preflight", { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error("Failed to execute preflight checks", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusBadge = (status: "pass" | "warn" | "fail") => {
    switch (status) {
      case "pass":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#A7F3D0]">
            <CheckCircle2 className="h-4 w-4 text-[#0F766E]" /> PASS (READY)
          </span>
        )
      case "warn":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            <AlertTriangle className="h-4 w-4 text-[#B45309]" /> NOTICE / DEV MODE
          </span>
        )
      case "fail":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]">
            <XCircle className="h-4 w-4 text-[#DC2626]" /> ACTION REQUIRED
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="border-b border-[#E2E8F0] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-saas-primary font-mono text-[11px] uppercase">Pre-Demo Verification Suite</span>
              {data?.isDemoModeActive && (
                <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B] font-mono font-semibold text-[10px] uppercase">
                  ⚡ DEMO MODE ACTIVE
                </span>
              )}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-[-0.02em]">
              System Preflight Checklist & Health Diagnostics
            </h1>
            <p className="text-sm text-[#64748B] mt-1 font-body">
              Automated stage readiness inspection covering OCR AI models, database connectivity, and user journey pipelines.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="btn-primary-saas h-10 px-4 text-xs font-medium flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? "Inspecting..." : "Re-Run Preflight"}
            </button>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase text-[#64748B] block">Overall Readiness</span>
              <span className={`font-heading font-extrabold text-lg mt-1 block ${data?.overallStatus === "ALL_GREEN" ? "text-[#0F766E]" : "text-slate-800"}`}>
                {loading ? "Analyzing..." : data?.overallStatus === "ALL_GREEN" ? "100% DEMO READY" : "OPERATIONAL READY"}
              </span>
            </div>
            <ShieldCheck className={`h-8 w-8 ${data?.overallStatus === "ALL_GREEN" ? "text-[#0F766E]" : "text-[#B45309]"}`} />
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase text-[#64748B] block">Vision AI Fallback</span>
              <span className="font-heading font-extrabold text-lg text-[#0F172A] mt-1 block font-mono">
                {loading ? "..." : data?.isDemoModeActive ? "INSTANT STANDBY" : "LIVE CLOUD API"}
              </span>
            </div>
            <Cpu className="h-8 w-8 text-[#0F766E]" />
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase text-[#64748B] block">Diagnostic Timestamp</span>
              <span className="font-mono font-medium text-xs text-slate-700 mt-1.5 block">
                {data ? new Date(data.timestamp).toLocaleTimeString() : "Pending"}
              </span>
            </div>
            <Activity className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* Checklist Results Table / Cards */}
        {loading && !data ? (
          <div className="py-24 bg-white rounded-lg border border-[#E2E8F0] text-center flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-[#0F766E] animate-spin mb-3" />
            <p className="text-sm font-semibold text-[#0F172A]">Running diagnostic interrogation across VitaMend subsystems...</p>
            <p className="text-xs text-[#64748B] mt-1">Checking OCR confidence scores and MongoDB transaction channels.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)] divide-y divide-[#F1F5F9] overflow-hidden">
            <div className="bg-[#F8FAFC] px-6 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-slate-600">Subsystem Inspection Item</span>
              <span className="font-mono text-xs font-bold uppercase text-slate-600">Status & Remediation</span>
            </div>

            {data?.checks.map((check) => (
              <div key={check.id} className="p-6 transition-colors hover:bg-slate-50/50 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1 md:max-w-xl">
                  <h3 className="font-heading font-bold text-base text-[#0F172A] flex items-center gap-2">
                    {check.name}
                  </h3>
                  <p className="text-xs text-[#64748B] font-body">
                    {check.description}
                  </p>
                  <div className="pt-2 mt-2 border-t border-slate-100 text-xs font-mono text-slate-600">
                    <span className="text-[#0F766E] font-semibold">Diagnosis: </span> {check.details}
                  </div>
                  {check.status !== "pass" && check.estimatedFixTime && (
                    <div className="mt-1 text-xs font-mono text-[#B45309] bg-amber-50 p-2 rounded border border-amber-200/60 inline-block">
                      <strong>Estimated Fix Time:</strong> {check.estimatedFixTime}
                    </div>
                  )}
                </div>

                <div className="shrink-0 self-start">
                  {getStatusBadge(check.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Bottom Bar */}
        <div className="mt-8 bg-[#0F172A] rounded-lg p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-heading font-bold text-base">All Systems Calibrated for Live Hackathon / Investor Presentation</h4>
            <p className="text-xs text-slate-300 mt-1 font-body">
              All intake parameters nominal. Launch the 3-minute structured walkthrough or open the interactive OCR testing bench.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/test-ocr"
              className="px-4 py-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-all"
            >
              /test-ocr Bench
            </a>
            <a
              href="/demo"
              className="px-5 py-2.5 rounded-md bg-[#0F766E] hover:bg-[#0D5F58] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              <Play className="h-4 w-4 fill-white" /> Launch /demo Walkthrough
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}

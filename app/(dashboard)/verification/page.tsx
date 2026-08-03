import type { Metadata } from "next";
import Link from "next/link";
import { Share2, Download, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Verification History",
};

export default function VerificationReportPage() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1">
            <Link href="/dashboard" className="text-[var(--accent-dark)] hover:underline">Operations Dashboard</Link>
            <span className="text-[var(--border)]">/</span>
            <span className="font-mono text-[var(--text-secondary)]">Audit Registry</span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[var(--text-primary)] tracking-tight">
            Medicine Verification & Safety Report
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <Share2 className="w-3.5 h-3.5" /> Share Verification Record
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-dark)] px-4 py-2 text-[13px] font-medium text-white hover:bg-[var(--accent-dark-hover)] transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> Download Safety Certificate
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-[var(--text-muted)]" />
        </div>
        <h2 className="text-lg font-serif font-medium text-[var(--text-primary)]">No verification records yet</h2>
        <p className="text-sm text-[var(--text-muted)] mt-2 max-w-md mx-auto leading-relaxed">
          Once donors submit medicine labels via OCR scan, verified safety reports will appear here after pharmacist approval.
        </p>
      </div>
    </div>
  );
}

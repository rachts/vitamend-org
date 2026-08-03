"use client";

import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";

export default function PlatformSettingsPage() {
  const [ocrConfidence, setOcrConfidence] = useState(95);
  const [autoQuarantine, setAutoQuarantine] = useState(true);
  const [shortageAlerts, setShortageAlerts] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1">
            <span>System Operations</span>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Platform Preferences</span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[var(--text-primary)] tracking-tight">
            Verification & Distribution Preferences
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Configure label OCR verification tolerance, safety quarantine procedures, and automated partner inventory notifications.
          </p>
        </div>
        <button type="button" onClick={handleSave} className="btn-primary text-xs px-4 py-2 flex items-center gap-2">
          <Save className="w-3.5 h-3.5" /> Save Settings
        </button>
      </div>

      {/* Configuration Console Grid */}
      <div className="space-y-6">
        {/* Module 1: Optical OCR Engine */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-sm font-serif font-medium text-[var(--text-primary)]">Automated Label OCR Scanner</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Set confidence threshold required for automated medicine verification upon donor scan.</p>
            </div>
            <span className="font-mono text-[10px] bg-[var(--bg-secondary)] border border-[var(--border)] px-2 py-0.5 rounded text-[var(--text-muted)]">
              STATUS: ACTIVE
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5 text-[var(--text-primary)]">
                <span>OCR Match Auto-Approval Threshold</span>
                <span className="font-mono font-bold text-[var(--accent-dark)]">{ocrConfidence}.0%</span>
              </div>
              <input
                type="range"
                min="85"
                max="99"
                value={ocrConfidence}
                onChange={(e) => setOcrConfidence(Number(e.target.value))}
                className="w-full accent-[var(--accent-dark)] cursor-pointer"
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Scans below this accuracy percentage will require secondary manual sign-off from a licensed volunteer pharmacist before entering active inventory.
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border)]/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-[var(--text-primary)] block">Auto-Quarantine Unverified or Expired Items</span>
                <span className="text-[11px] text-[var(--text-muted)]">Automatically block redistribution of medicines that fail safety database checks or fall past expiration date.</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoQuarantine(!autoQuarantine)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                  autoQuarantine ? "bg-[var(--accent-dark)] justify-end" : "bg-[var(--bg-secondary)] justify-start border border-[var(--border)]"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Module 2: Storage & Safety Standards */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-sm font-serif font-medium text-[var(--text-primary)]">Storage Compliance & Clinic Notifications</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Guidelines for partner storage facilities and priority clinic deficit alerts.</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
              HEALTHCARE COMPLIANT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Standard Cold-Storage Temperature Limit</label>
              <input type="text" readOnly value="2°C – 8°C (Refrigerated Items)" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]/40 px-3 py-2 text-xs font-mono text-[var(--text-primary)]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Minimum Shelf Life Before Redistribution</label>
              <input type="text" readOnly value="60 Days Minimum Required" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]/40 px-3 py-2 text-xs font-mono text-[var(--text-primary)]" />
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border)]/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[var(--text-primary)] block">Urgent Deficit Push Notifications</span>
              <span className="text-[11px] text-[var(--text-muted)]">Send immediate platform notifications to volunteer teams when community clinics report critical medicine shortages.</span>
            </div>
            <button
              type="button"
              onClick={() => setShortageAlerts(!shortageAlerts)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                shortageAlerts ? "bg-[var(--accent-dark)] justify-end" : "bg-[var(--bg-secondary)] justify-start border border-[var(--border)]"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <span className="text-[11px] text-[var(--text-muted)] font-mono">STATUS: CONFIGURATION SAVED & SYNCHRONIZED</span>
          <div className="flex items-center gap-3">
            {savedNotice && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Preferences saved successfully
              </span>
            )}
            <button type="button" onClick={handleSave} className="btn-primary text-xs px-6 py-2 flex items-center gap-2">
              <Save className="w-3.5 h-3.5" /> Save & Apply Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

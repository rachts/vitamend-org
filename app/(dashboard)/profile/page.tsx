"use client";

import { useState } from "react";
import { User, BadgeCheck, Save, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const [isSaved, setIsSaved] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [regId, setRegId] = useState("");
  const [node, setNode] = useState("");
  const [address, setAddress] = useState("");

  const hasAnyField = Boolean(fullName.trim() || email.trim() || regId.trim() || node.trim() || address.trim());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRevoke = () => {
    setFullName("");
    setEmail("");
    setRegId("");
    setNode("");
    setAddress("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1">
            <span>Node Governance</span>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Inspector Credentials</span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[var(--text-primary)] tracking-tight">Practitioner Setup</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Manage institutional licensing parameters, cryptographic HMAC signoff keys, and regional dispensary authorization.
          </p>
        </div>
        <button className="btn-ghost flex items-center gap-2 text-xs h-9">
          <BadgeCheck className="w-3.5 h-3.5" /> Verify CDSCO License
        </button>
      </div>

      {/* Profile Completion Card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">Complete your profile</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Add your credentials to begin submitting verified manifests.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Attestation Status</p>
          <p className="text-xs text-amber-700 mt-0.5 flex items-center gap-1 justify-end">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending profile completion
          </p>
        </div>
      </div>

      {/* Identity Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-6">
          <div>
            <h3 className="text-sm font-serif font-medium text-[var(--text-primary)]">Institutional Identity & Location</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Updated changes are recorded on the public municipal verification ledger.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Full Name & Clinical Degree</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Jane Smith, PharmD"
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dark)]/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Professional Institutional Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@hospital.org"
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dark)]/20 font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">CDSCO State Pharmacy Registration ID</label>
              <input
                type="text"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                placeholder="MH-XXXXX-CDSCO-YYYY"
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dark)]/20 font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Primary Healthcare Node & Dispensary</label>
              <input
                type="text"
                value={node}
                onChange={(e) => setNode(e.target.value)}
                placeholder="Hospital or Dispensary Name"
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dark)]/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Physical Dispatch & Custodial Loading Bay</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address including PIN"
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dark)]/20"
            />
          </div>
        </div>

        {/* Cryptographic Signing Fingerprint Card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-sm font-serif font-medium text-[var(--text-primary)]">Cryptographic Attestation Keys</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Used to sign outbound OCR surplus manifests and authenticate inventory receipt.</p>
            </div>
            <span className="font-mono text-[10px] bg-[var(--bg-secondary)] border border-[var(--border)] px-2 py-0.5 rounded text-[var(--text-muted)]">
              SHA-256 HMAC
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[var(--bg-secondary)]/40 border border-[var(--border)] text-xs space-y-1">
            <div className="text-[var(--text-primary)] font-medium font-mono">No attestation key registered</div>
            <div className="text-[var(--text-muted)]">A key pair will be generated when you complete profile setup.</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          {hasAnyField ? (
            <button type="button" onClick={handleRevoke} className="text-xs font-medium text-red-600 hover:underline">
              Revoke Node Access
            </button>
          ) : <div />}
          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ledger profile updated
              </span>
            )}
            <button type="submit" className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2">
              <Save className="w-3.5 h-3.5" /> Save Practitioner Credentials
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

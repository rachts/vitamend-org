import React from "react";
import { ShieldCheck, UserCheck, Lock, Award, Thermometer } from "lucide-react";

export interface TrustBadgeProps {
  variant?: "ai" | "pharmacist" | "encrypted" | "cdsco" | "temperature";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TrustBadge({ variant = "ai", className = "", size = "md" }: TrustBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-xs font-medium gap-2",
  };

  const badgeConfigs = {
    ai: {
      label: "AI OCR Verified",
      icon: ShieldCheck,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    pharmacist: {
      label: "Licensed Pharmacist Approved",
      icon: UserCheck,
      color: "bg-[#3E492B]/10 text-[#3E492B] border-[#3E492B]/20",
    },
    encrypted: {
      label: "256-bit Encrypted Ledger",
      icon: Lock,
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    cdsco: {
      label: "CDSCO Guidelines Compliant",
      icon: Award,
      color: "bg-blue-50 text-blue-800 border-blue-200",
    },
    temperature: {
      label: "Cold-Chain Temperature Monitored",
      icon: Thermometer,
      color: "bg-teal-50 text-teal-800 border-teal-200",
    },
  };

  const config = badgeConfigs[variant] || badgeConfigs.ai;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-sans font-medium transition-all ${sizeClasses[size]} ${config.color} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}

export function TrustBadgesGroup({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <TrustBadge variant="ai" size="sm" />
      <TrustBadge variant="pharmacist" size="sm" />
      <TrustBadge variant="cdsco" size="sm" />
      <TrustBadge variant="encrypted" size="sm" />
    </div>
  );
}

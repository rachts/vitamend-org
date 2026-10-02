import React from "react";
import { ShieldCheck, UserCheck, Lock, Award, Thermometer } from "lucide-react";

export interface TrustBadgeProps {
  variant?: "ai" | "pharmacist" | "encrypted" | "cdsco" | "temperature";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TrustBadge({ variant = "ai", className = "", size = "md" }: TrustBadgeProps) {
  const sizeClasses = {
    sm: "px-2.5 py-1 text-[11px] gap-1.5",
    md: "px-3 py-1.5 text-xs gap-1.5",
    lg: "px-3.5 py-2 text-xs font-medium gap-2",
  };

  const badgeConfigs = {
    ai: {
      label: "AI-Assisted Label Intake",
      icon: ShieldCheck,
      color: "bg-[#EDE9DF] text-[#1C1A14] border-[#D8D2C4]",
    },
    pharmacist: {
      label: "Licensed Pharmacist Inspection",
      icon: UserCheck,
      color: "bg-[#EDE9DF] text-[#1C1A14] border-[#D8D2C4]",
    },
    encrypted: {
      label: "Encrypted Database Storage",
      icon: Lock,
      color: "bg-[#EDE9DF] text-[#1C1A14] border-[#D8D2C4]",
    },
    cdsco: {
      label: "Aligned with CDSCO Guidelines",
      icon: Award,
      color: "bg-[#EDE9DF] text-[#1C1A14] border-[#D8D2C4]",
    },
    temperature: {
      label: "Documented Storage Conditions",
      icon: Thermometer,
      color: "bg-[#EDE9DF] text-[#1C1A14] border-[#D8D2C4]",
    },
  };

  const config = badgeConfigs[variant] || badgeConfigs.ai;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-md border font-sans font-medium transition-colors ${sizeClasses[size]} ${config.color} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0 text-[#2C3320]" />
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

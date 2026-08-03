"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Package, ShieldCheck, Activity, Bell, User, Settings, ShieldAlert } from "lucide-react";

export default function DashboardSubNav() {
  const pathname = usePathname();
  const { data: session } = useSession() || {};
  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "volunteer";

  const userTabs = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Inventory", href: "/inventory", icon: Package },
    { label: "Verification", href: "/verification", icon: ShieldCheck },
    { label: "Platform", href: "/platform", icon: Activity },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const adminTabs = [
    { label: "Admin Queue", href: "/admin/review", icon: ShieldAlert },
    { label: "Admin Inventory", href: "/admin/inventory", icon: Package },
    { label: "Admin Analytics", href: "/admin/analytics", icon: Activity },
  ];

  const tabs = isAdmin ? [...userTabs, ...adminTabs] : userTabs;

  return (
    <nav className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none" aria-label="Dashboard Sub Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-3.5 py-2 text-[0.825rem] font-medium rounded-[var(--radius-sm)] whitespace-nowrap transition-colors ${
              isActive
                ? "bg-[var(--accent-dark)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            }`}
          >
            <Icon size={15} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

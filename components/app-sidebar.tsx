"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Inbox,
  Bell,
  Package,
  ShieldCheck,
  ClipboardCheck,
  Truck,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  UserCircle2,
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession() || {};
  const role = session?.user?.role || "user";
  const userName = session?.user?.name || "Guest Session";
  const userEmail = session?.user?.email || "Sign in to save progress";

  const navGroups = [
    {
      category: "OPERATIONS",
      items: [
        { title: "Overview Dashboard", url: "/dashboard", icon: Inbox },
        { title: "Notifications", url: "/notifications", icon: Bell },
        { title: "Available Inventory", url: "/inventory", icon: Package },
        { title: "Verification History", url: "/verification", icon: ShieldCheck },
      ],
    },
    ...(role === "admin" || role === "volunteer"
      ? [
          {
            category: "ADMINISTRATION",
            items: [
              { title: "Review Queue", url: "/admin/review", icon: ClipboardCheck },
              { title: "Distributions", url: "/admin/distributions", icon: Truck },
            ],
          },
        ]
      : []),
    {
      category: "GOVERNANCE",
      items: [
        { title: "Your Profile", url: "/profile", icon: User },
        { title: "Platform Settings", url: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <nav className="md:hidden fixed top-0 w-full z-50 bg-[var(--bg-primary)] border-b border-[var(--border)] px-4 flex justify-between items-center h-14">
        <Link href="/" className="flex items-center gap-2 font-serif text-[15px] text-[var(--text-primary)] font-semibold">
          <div className="w-5 h-5 rounded bg-[var(--accent-dark)] text-white flex items-center justify-center text-[11px]">V</div>
          VitaMend
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-[var(--text-muted)] p-2 hover:text-[var(--text-primary)] transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 w-full bg-[var(--bg-primary)] border-b border-[var(--border)] z-40 flex flex-col p-4 gap-5 shadow-sm font-sans">
          {navGroups.map((group) => (
            <div key={group.category} className="flex flex-col">
              <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider px-2 mb-1.5">
                {group.category}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.url);
                  return (
                    <Link
                      key={item.title}
                      href={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
                        isActive
                          ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium underline decoration-[var(--accent-dark)] underline-offset-4"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                      }`}
                    >
                      <Icon size={18} className="text-[var(--text-muted)]" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex h-screen w-[220px] min-w-[220px] max-w-[220px] fixed left-0 top-0 bg-[var(--bg-primary)] border-r border-[var(--border)] flex-col py-5 z-40 font-sans select-none">
        <div className="px-4 mb-6">
          <Link href="/" className="flex items-center gap-2 group mb-2">
            <div className="w-6 h-6 rounded-md bg-[var(--accent-dark)] text-white flex items-center justify-center font-bold text-[12px] font-serif shadow-sm">
              V
            </div>
            <span className="font-serif text-[15px] text-[var(--text-primary)] font-semibold">VitaMend</span>
          </Link>
        </div>

        <div className="flex flex-col px-3 flex-1 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.category} className="flex flex-col mt-4">
              <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider px-2 mb-1">
                {group.category}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.url);
                  return (
                    <Link
                      key={item.title}
                      href={item.url}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors text-[13px] ${
                        isActive
                          ? "text-[var(--text-primary)] font-medium bg-[var(--bg-secondary)] border-l-2 border-[var(--accent-dark)] underline decoration-[var(--accent-dark)] underline-offset-4"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                      }`}
                    >
                      <Icon size={18} className={isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"} />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto px-3 border-t border-[var(--border)] pt-3">
          <div className="px-2.5 pb-1.5 flex items-center gap-2.5 mb-3">
            <UserCircle2 size={28} className="text-[var(--text-muted)] shrink-0" />
            <div className="flex flex-col overflow-hidden text-[12px] text-[var(--text-muted)]">
              <span className="font-medium text-[var(--text-primary)] truncate">{userName}</span>
              <span className="text-[11px] text-[var(--text-muted)] truncate">{userEmail}</span>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
            >
              <LogOut size={18} className="text-[var(--text-muted)]" />
              Sign Out
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

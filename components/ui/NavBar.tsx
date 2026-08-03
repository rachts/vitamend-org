"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Activity,
  Bell,
  User,
  Settings,
  LucideIcon,
  Heart,
  Store,
  Users,
  Building2,
  BookOpen,
  Info,
  PhoneCall,
  BarChart3,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession() || {};

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDashboardRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/inventory") ||
    pathname?.startsWith("/verification") ||
    pathname?.startsWith("/platform") ||
    pathname?.startsWith("/notifications") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/admin");

  const publicLinks: NavItem[] = [
    { label: "Donate", href: "/donate", icon: Heart },
    { label: "Store", href: "/store", icon: Store },
    { label: "Volunteer", href: "/volunteer", icon: Users },
    { label: "Clinics", href: "/clinics", icon: Building2 },
    { label: "Transparency", href: "/transparency", icon: BarChart3 },
    { label: "Donor Guide", href: "/donor-guide", icon: BookOpen },
    { label: "About", href: "/about", icon: Info },
    { label: "Contact", href: "/contact", icon: PhoneCall },
  ];

  const dashboardLinks: NavItem[] = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Inventory", href: "/inventory", icon: Package },
    { label: "Verification", href: "/verification", icon: ShieldCheck },
    { label: "Platform", href: "/platform", icon: Activity },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const navLinks = session && isDashboardRoute ? dashboardLinks : publicLinks;
  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border)] py-3 shadow-xs"
          : "bg-[var(--bg-primary)] py-4 border-b border-[var(--border)]/60"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-dark)] text-white flex items-center justify-center font-serif font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
            V
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-[var(--text-primary)] leading-none">
              VitaMend
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)]">
              Redistributing Care
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all ${
                  active
                    ? "bg-[var(--accent-dark)] text-white font-semibold shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          {/* Auth Button */}
          {session ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="btn-primary text-xs px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm"
              >
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="p-2 rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="btn-secondary text-xs px-4 py-2 rounded-full"
              >
                Sign In
              </Link>
              <Link
                href="/donate"
                className="btn-primary text-xs px-4 py-2 rounded-full flex items-center gap-1 shadow-sm"
              >
                Donate Meds
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full border border-[var(--border)] text-[var(--text-secondary)]"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-primary)]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[var(--bg-primary)] border-b border-[var(--border)] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-sans text-xs font-medium transition-colors ${
                    active
                      ? "bg-[var(--accent-dark)] text-white font-semibold"
                      : "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--border)]/40"
                  }`}
                >
                  {Icon && <Icon size={14} />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-2">
            {session ? (
              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary flex-1 justify-center text-xs py-2.5 rounded-xl"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="btn-secondary text-xs px-4 py-2.5 rounded-xl text-red-600 border-red-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary justify-center text-xs py-2.5 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/donate"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary justify-center text-xs py-2.5 rounded-xl"
                >
                  Donate Meds
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

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
import { NotificationBell } from "@/components/NotificationBell";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-[#F5F2EC] border-b border-[#D8D2C4] ${
        scrolled ? "py-2.5" : "py-3.5"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-md bg-[#2C3320] text-white flex items-center justify-center font-serif font-bold text-base">
            V
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-[#1C1A14] leading-none">
              VitaMend
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#5C5545]">
              Redistributing Care
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md font-sans text-xs font-medium transition-colors ${
                  active
                    ? "bg-[#2C3320] text-white font-semibold"
                    : "text-[#5C5545] hover:text-[#1C1A14] hover:bg-[#EDE9DF]"
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
              className="p-2 rounded-md border border-[#D8D2C4] text-[#5C5545] hover:text-[#1C1A14] hover:bg-[#EDE9DF] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          {/* Auth Button */}
          {session ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link
                href="/dashboard"
                className="bg-[#2C3320] text-white text-xs px-3.5 py-1.5 rounded-md flex items-center gap-1.5 hover:bg-[#3D4A2E] transition-colors"
              >
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-md border border-[#D8D2C4] text-[#5C5545] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="border border-[#D8D2C4] bg-white text-[#1C1A14] text-xs px-3.5 py-1.5 rounded-md hover:bg-[#EDE9DF] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/donate"
                className="bg-[#2C3320] text-white text-xs px-3.5 py-1.5 rounded-md flex items-center gap-1 hover:bg-[#3D4A2E] transition-colors"
              >
                Donate Medicine
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md border border-[#D8D2C4] text-[#5C5545]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md border border-[#D8D2C4] text-[#1C1A14]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#F5F2EC] border-b border-[#D8D2C4] px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md font-sans text-xs font-medium transition-colors ${
                    active
                      ? "bg-[#2C3320] text-white font-semibold"
                      : "bg-[#EDE9DF] text-[#1C1A14] hover:bg-[#D8D2C4]"
                  }`}
                >
                  {Icon && <Icon size={14} />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#D8D2C4] flex flex-col gap-2">
            {session ? (
              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="bg-[#2C3320] text-white flex-1 justify-center text-center text-xs py-2 rounded-md hover:bg-[#3D4A2E]"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="border border-red-200 text-red-700 bg-white text-xs px-4 py-2 rounded-md hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="border border-[#D8D2C4] bg-white text-[#1C1A14] text-center text-xs py-2 rounded-md hover:bg-[#EDE9DF]"
                >
                  Sign In
                </Link>
                <Link
                  href="/donate"
                  onClick={() => setMobileOpen(false)}
                  className="bg-[#2C3320] text-white text-center text-xs py-2 rounded-md hover:bg-[#3D4A2E]"
                >
                  Donate Medicine
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

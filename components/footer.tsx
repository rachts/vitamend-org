"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2, Mail, MapPin, Award } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[var(--bg-secondary)] border-t border-[var(--border)] pt-16 pb-8 px-4 sm:px-6 lg:px-8 mt-auto font-sans text-[#3E492B]">
      <div className="max-w-[1440px] mx-auto space-y-12">
        {/* Newsletter & Brand Header Bar */}
        <div className="rounded-2xl border border-[var(--border)] bg-white/60 backdrop-blur-sm p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-serif font-medium text-[var(--text-primary)]">
              Stay Updated on Medicine Redistribution & Impact
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md">
              Receive monthly transparency reports, compliance updates, and community clinic shortage alerts.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex items-center gap-2">
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4" /> Thank you for subscribing!
              </div>
            ) : (
              <div className="relative w-full md:w-80 flex items-center">
                <input
                  type="email"
                  placeholder="Enter your official email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dark)]/20"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1.5 btn-primary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  Join <Send className="w-3 h-3" />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Simplified 3-Column Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-4">
          {/* Col 1: Action */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <Link href="/donate" className="hover:text-[var(--text-primary)] transition-colors">
                  Donate Medicine
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-[var(--text-primary)] transition-colors">
                  Public Medicine Store
                </Link>
              </li>
              <li>
                <Link href="/volunteer" className="hover:text-[var(--text-primary)] transition-colors">
                  Become a Volunteer
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Impact
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <Link href="/transparency" className="hover:text-[var(--text-primary)] transition-colors">
                  Impact Dashboard
                </Link>
              </li>
              <li>
                <Link href="/clinics" className="hover:text-[var(--text-primary)] transition-colors">
                  Partner Clinics
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Legal
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <Link href="/legal/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-[var(--text-primary)] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact & Badge Summary */}
        <div className="pt-8 border-t border-[var(--border)] grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--accent-dark)] shrink-0" />
            <span>Email: <a href="mailto:contact@vitamend.in" className="font-medium hover:underline">contact@vitamend.in</a></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--accent-dark)] shrink-0" />
            <span>HQ: Healthcare Supply Chain Hub, New Delhi, India</span>
          </div>
          <div className="flex items-center gap-2 md:justify-end">
            <Award className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 text-[11px]">
              Protocols aligned with CDSCO & CPCB guidelines
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-[var(--border)] text-xs text-[var(--text-muted)] font-mono">
          <span>© {new Date().getFullYear()} VitaMend Healthcare Foundation. All rights reserved.</span>
          <button
            onClick={scrollToTop}
            className="hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest font-sans font-semibold"
          >
            BACK TO TOP ↑
          </button>
        </div>
      </div>
    </footer>
  );
}

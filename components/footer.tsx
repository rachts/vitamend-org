"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2 } from "lucide-react";

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
    <footer className="w-full bg-[#EDE9DF] border-t border-[#D8D2C4] pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-auto font-sans text-[#1C1A14]">
      <div className="max-w-[1440px] mx-auto space-y-10">
        {/* Newsletter & Brand Header Bar */}
        <div className="rounded-lg border border-[#D8D2C4] bg-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-serif text-[#1C1A14]">
              Stay Updated on Medicine Redistribution
            </h3>
            <p className="text-xs text-[#5C5545] max-w-md">
              Receive updates on verified medicine distribution manifests, clinic requests, and redistribution protocols.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex items-center gap-2">
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#2C3320] bg-[#EDE9DF] border border-[#D8D2C4] px-4 py-2.5 rounded-md">
                <CheckCircle2 className="w-4 h-4 text-[#2C3320]" /> Thank you for subscribing.
              </div>
            ) : (
              <div className="relative w-full md:w-80 flex items-center">
                <label htmlFor="newsletter-email" className="sr-only">Email address for newsletter</label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-md border border-[#D8D2C4] bg-[#F5F2EC] text-xs text-[#1C1A14] placeholder:text-[#9A9080] focus:outline-none focus:ring-1 focus:ring-[#2C3320]"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 bg-[#2C3320] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-[#3D4A2E] transition-colors"
                >
                  Join <Send className="w-3 h-3" />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* 4-Column Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-2">
          {/* Col 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5545]">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#5C5545]">
              <li>
                <Link href="/donate" className="hover:text-[#1C1A14] transition-colors">
                  Donate a Medicine
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-[#1C1A14] transition-colors">
                  Available Medicines
                </Link>
              </li>
              <li>
                <Link href="/donor-guide" className="hover:text-[#1C1A14] transition-colors">
                  Donor Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Operations */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5545]">
              Operations
            </h4>
            <ul className="space-y-2 text-xs text-[#5C5545]">
              <li>
                <Link href="/clinics" className="hover:text-[#1C1A14] transition-colors">
                  Partner Health Clinics
                </Link>
              </li>
              <li>
                <Link href="/volunteer" className="hover:text-[#1C1A14] transition-colors">
                  Volunteer Verification
                </Link>
              </li>
              <li>
                <Link href="/transparency" className="hover:text-[#1C1A14] transition-colors">
                  Redistribution Ledger
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5545]">
              Compliance & Legal
            </h4>
            <ul className="space-y-2 text-xs text-[#5C5545]">
              <li>
                <Link href="/privacy-policy" className="hover:text-[#1C1A14] transition-colors font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-[#1C1A14] transition-colors font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/ai-disclosure" className="hover:text-[#1C1A14] transition-colors font-medium">
                  AI and OCR Disclosure
                </Link>
              </li>
              <li>
                <Link href="/legal/disclaimer" className="hover:text-[#1C1A14] transition-colors">
                  Medical Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/legal/disposal" className="hover:text-[#1C1A14] transition-colors">
                  Safe Disposal Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5545]">
              Contact
            </h4>
            <ul className="space-y-2 text-xs text-[#5C5545]">
              <li>
                <a href="mailto:contact@vitamend.in" className="hover:text-[#1C1A14] transition-colors">
                  contact@vitamend.in
                </a>
              </li>
              <li className="text-[11px] leading-relaxed text-[#9A9080]">
                VitaMend is a non-profit technology bridge. We do not sell pharmaceuticals or provide medical advice.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-[#D8D2C4] text-xs text-[#5C5545]">
          <span>© {new Date().getFullYear()} VitaMend. All rights reserved.</span>
          <button
            onClick={scrollToTop}
            className="hover:text-[#1C1A14] transition-colors uppercase tracking-wider text-[11px] font-medium"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}

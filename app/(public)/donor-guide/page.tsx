import type { Metadata } from "next";
import Link from "next/link";
import { FAQSection } from "@/components/faq";
import { TrustBadge } from "@/components/trust-badges";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Award,
  ArrowRight,
  Thermometer,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Donor Guide | Accepted Medicines & Packaging Protocols",
  description:
    "Complete guidelines for donating surplus pharmaceuticals to VitaMend. Learn about accepted medicines, packaging requirements, doorstep pickup, and AI verification timelines.",
};

export default function DonorGuidePage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3E492B] font-sans pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header Hero */}
        <div className="rounded-3xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-12 shadow-sm text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E492B]/10 text-[#3E492B] text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" /> Comprehensive Donor Guide
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#3E492B]">
            How to Donate Surplus Medicine Safely
          </h1>
          <p className="text-base sm:text-lg text-[#3E492B]/80 leading-relaxed font-sans max-w-2xl mx-auto">
            Our step-by-step donor protocol ensures 100% medical safety, regulatory compliance, and seamless logistics from your doorstep to community health clinics.
          </p>
          <div className="pt-2 flex justify-center">
            <TrustBadge variant="cdsco" size="lg" />
          </div>
        </div>

        {/* Accepted vs Rejected Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Accepted Medicines */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-medium text-emerald-950">Accepted Medicines</h2>
                <p className="text-xs text-emerald-800">Eligible for intake and redistribution</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-emerald-900 font-sans">
              {[
                "Un-opened, factory-sealed blister packs or strip packaging",
                "Sealed syrup or suspension bottles with intact tamper-evident ring",
                "Medicines with at least 60 days of remaining shelf life prior to expiry",
                "Over-the-counter & prescription oral tablets, capsules, and supplements",
                "Unused topical ointments/creams in original sealed aluminum tubes",
                "Clear, legible batch number, NDC code, and expiry date printed on package",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rejected Medicines */}
          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-medium text-red-950">Strictly Rejected Items</h2>
                <p className="text-xs text-red-800">Must be routed to safe biohazard disposal</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-red-900 font-sans">
              {[
                "Opened bottles, loose un-wrapped pills, or broken blister seals",
                "Expired medications or items within 30 days of expiration date",
                "Controlled narcotics, psychiatric drugs, or habit-forming substances",
                "Temperature-sensitive cold-chain items (e.g. Insulin) unless institutional intake",
                "Injectable ampoules/vials with broken safety seals or missing labels",
                "Packages with defaced, cut-off, or illegible expiry date stamps",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4 Core Rules Overview */}
        <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-10 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
              DONATION STANDARDS
            </span>
            <h2 className="text-3xl font-serif font-medium text-[#3E492B]">4 Key Packaging & Safety Rules</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-[#3E492B]/80">
            <div className="p-5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 space-y-2">
              <Package className="w-6 h-6 text-[#3E492B]" />
              <h4 className="font-serif text-base font-medium text-[#3E492B]">1. Keep in Original Blister</h4>
              <p className="leading-relaxed">Never cut blister strips into individual tablets as batch details must remain attached.</p>
            </div>

            <div className="p-5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 space-y-2">
              <Clock className="w-6 h-6 text-[#3E492B]" />
              <h4 className="font-serif text-base font-medium text-[#3E492B]">2. 60-Day Expiry Buffer</h4>
              <p className="leading-relaxed">Medicines must have at least 60 days of shelf life to allow time for redistribution and dispensing.</p>
            </div>

            <div className="p-5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 space-y-2">
              <Thermometer className="w-6 h-6 text-[#3E492B]" />
              <h4 className="font-serif text-base font-medium text-[#3E492B]">3. Room Storage (15-25°C)</h4>
              <p className="leading-relaxed">Ensure items have been stored in dry, cool conditions away from direct sunlight.</p>
            </div>

            <div className="p-5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 space-y-2">
              <Award className="w-6 h-6 text-[#3E492B]" />
              <h4 className="font-serif text-base font-medium text-[#3E492B]">4. Earn Impact Credits</h4>
              <p className="leading-relaxed">Donors receive digital certification and carbon offset impact credits upon verified intake.</p>
            </div>
          </div>
        </div>

        {/* Pickup & Verification Timeline */}
        <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDD8CF]">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
                LOGISTICS & AI SCAN
              </span>
              <h2 className="text-2xl font-serif font-medium text-[#3E492B] mt-1">Pickup to Dispatch Timeline</h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              AVERAGE TIMELINE: 24–48 HOURS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-[#3E492B]/80">
            {[
              { step: "01", title: "Submit OCR Photo", time: "Instant (10s)", desc: "Upload clear photo of label to auto-extract expiry date & batch details." },
              { step: "02", title: "Schedule Pickup", time: "Same / Next Day", desc: "Volunteer pickup agent collects package at your designated address." },
              { step: "03", title: "Pharmacist Sign-Off", time: "Within 12 Hours", desc: "Secondary physical inspection logged by licensed verification pharmacist." },
              { step: "04", title: "Clinic Dispatch", time: "Within 24 Hours", desc: "Package routed to priority health center with full digital ledger code." },
            ].map((t) => (
              <div key={t.step} className="p-5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-[#3E492B]">STAGE {t.step}</span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#DDD8CF]">{t.time}</span>
                </div>
                <h4 className="font-serif text-base font-medium text-[#3E492B]">{t.title}</h4>
                <p className="text-[#3E492B]/70 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Knowledge Base */}
        <FAQSection title="Donor Guidelines FAQ" />

        {/* CTA Banner */}
        <div className="rounded-3xl border border-[#DDD8CF] bg-[#3E492B] text-white p-8 sm:p-12 text-center space-y-6 shadow-md">
          <h2 className="text-3xl sm:text-4xl font-serif font-medium">Ready to Donate Your Surplus Medicine?</h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-sans">
            Use our AI label scanner to check your medicine eligibility and schedule a doorstep pickup in under 2 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/donate" className="btn-primary bg-white text-[#3E492B] hover:bg-white/90 px-6 py-3 text-xs">
              Start Medicine Scan <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/store" className="btn-secondary border-white/40 text-white hover:bg-white/10 px-6 py-3 text-xs">
              Browse Available Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

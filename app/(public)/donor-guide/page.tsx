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
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Donor Guide | Accepted Medicines & Packaging Protocols",
  description:
    "Complete guidelines for donating surplus pharmaceuticals to VitaMend. Learn about accepted medicines, packaging requirements, doorstep pickup, and AI verification timelines.",
};

export default function DonorGuidePage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#1C1A14] font-sans pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Hero */}
        <div className="rounded-lg border border-[#D8D2C4] bg-white p-8 sm:p-10 text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EDE9DF] text-[#1C1A14] text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#2C3320]" /> Donor Guidelines
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1C1A14]">
            How to Donate Surplus Medicine Safely
          </h1>
          <p className="text-base text-[#5C5545] leading-relaxed font-sans max-w-2xl mx-auto">
            Our donor protocol verifies medicine packaging, seal integrity, and expiration dates before routing stock to community health clinics.
          </p>
          <div className="pt-2 flex justify-center">
            <TrustBadge variant="cdsco" size="lg" />
          </div>
        </div>

        {/* Accepted vs Rejected Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Accepted Medicines */}
          <div className="rounded-lg border border-[#D8D2C4] bg-white p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-[#EDE9DF] text-[#2C3320] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-serif text-[#1C1A14]">Accepted Medicines</h2>
                <p className="text-xs text-[#5C5545]">Eligible for intake and redistribution</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-[#1C1A14] font-sans">
              {[
                "Un-opened, factory-sealed blister packs or strip packaging",
                "Sealed syrup or suspension bottles with intact tamper-evident ring",
                "Medicines with at least 60 days of remaining shelf life prior to expiry",
                "Unexpired prescription tablets and capsules in original cartons",
                "Unused medical supplies (gauze, sealed dressings, disposable syringes)",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strictly Prohibited Medicines */}
          <div className="rounded-lg border border-[#D8D2C4] bg-white p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-serif text-[#1C1A14]">Strictly Prohibited</h2>
                <p className="text-xs text-[#5C5545]">Cannot be accepted due to safety guidelines</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-[#1C1A14] font-sans">
              {[
                "Opened bottles, unsealed liquid syrups, or loose pills",
                "Controlled substances, Schedule X drugs, or narcotics",
                "Temperature-sensitive cold-chain items without documented cold logs",
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
        <div className="rounded-lg border border-[#D8D2C4] bg-white p-6 sm:p-8 space-y-6">
          <div className="max-w-2xl space-y-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5545]">
              Donation Standards
            </span>
            <h2 className="text-2xl font-serif text-[#1C1A14]">4 Key Packaging and Safety Rules</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-[#5C5545]">
            <div className="p-4 rounded-md border border-[#D8D2C4] bg-[#F5F2EC] space-y-2">
              <Package className="w-5 h-5 text-[#2C3320]" />
              <h3 className="font-serif text-base font-medium text-[#1C1A14]">1. Keep in Original Blister</h3>
              <p className="leading-relaxed">Never cut blister strips into individual tablets as batch details must remain attached.</p>
            </div>

            <div className="p-4 rounded-md border border-[#D8D2C4] bg-[#F5F2EC] space-y-2">
              <Clock className="w-5 h-5 text-[#2C3320]" />
              <h3 className="font-serif text-base font-medium text-[#1C1A14]">2. 60-Day Expiry Buffer</h3>
              <p className="leading-relaxed">Medicines must have at least 60 days of shelf life to allow time for redistribution and dispensing.</p>
            </div>

            <div className="p-4 rounded-md border border-[#D8D2C4] bg-[#F5F2EC] space-y-2">
              <Thermometer className="w-5 h-5 text-[#2C3320]" />
              <h3 className="font-serif text-base font-medium text-[#1C1A14]">3. Room Storage (15 to 25°C)</h3>
              <p className="leading-relaxed">Ensure items have been stored in dry, cool conditions away from direct sunlight.</p>
            </div>

            <div className="p-4 rounded-md border border-[#D8D2C4] bg-[#F5F2EC] space-y-2">
              <Award className="w-5 h-5 text-[#2C3320]" />
              <h3 className="font-serif text-base font-medium text-[#1C1A14]">4. Verified Intake Record</h3>
              <p className="leading-relaxed">Donors receive a digital receipt and tracking code upon intake verification.</p>
            </div>
          </div>
        </div>

        {/* Pickup & Verification Timeline */}
        <div className="rounded-lg border border-[#D8D2C4] bg-white p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8D2C4]">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5545]">
                Logistics & Verification
              </span>
              <h2 className="text-2xl font-serif text-[#1C1A14] mt-1">Intake to Dispatch Timeline</h2>
            </div>
            <span className="text-[11px] font-mono text-[#2C3320] bg-[#EDE9DF] px-3 py-1 rounded-md border border-[#D8D2C4]">
              Estimated Timeline: 24 to 48 Hours
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-[#5C5545]">
            {[
              { step: "01", title: "Upload Packaging Photo", time: "Intake", desc: "Upload clear photo of label to extract expiry date and batch details." },
              { step: "02", title: "Dropoff or Pickup", time: "1 to 2 Days", desc: "Drop off package at a partner drop-box or schedule doorstep pickup." },
              { step: "03", title: "Pharmacist Inspection", time: "Within 24 Hours", desc: "Physical seal inspection verified by a licensed pharmacist." },
              { step: "04", title: "Clinic Dispatch", time: "Dispatched", desc: "Package allocated and shipped to verified health clinic." },
            ].map((t) => (
              <div key={t.step} className="p-4 rounded-md border border-[#D8D2C4] bg-[#F5F2EC] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-[#1C1A14]">STAGE {t.step}</span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#D8D2C4]">{t.time}</span>
                </div>
                <h3 className="font-serif text-base font-medium text-[#1C1A14]">{t.title}</h3>
                <p className="leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Knowledge Base */}
        <FAQSection title="Donor Guidelines FAQ" />

        {/* CTA Banner */}
        <div className="rounded-lg border border-[#D8D2C4] bg-[#2C3320] text-white p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-serif font-medium">Ready to Donate Your Surplus Medicine?</h2>
          <p className="text-sm sm:text-base text-[#EDE9DF] max-w-xl mx-auto font-sans leading-relaxed">
            Check your medicine eligibility and submit your donation details to begin verification.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/donate" className="bg-white text-[#2C3320] hover:bg-[#F5F2EC] px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
              Donate a Medicine <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/store" className="border border-white/40 text-white hover:bg-white/10 px-6 py-3 rounded-md text-sm font-medium transition-colors">
              View Available Medicines
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

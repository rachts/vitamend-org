"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
  category?: "Donation" | "Verification" | "Logistics" | "Safety";
}

export const defaultFAQs: FAQItem[] = [
  {
    category: "Donation",
    question: "Which medicines are accepted for donation?",
    answer:
      "We accept un-opened, factory-sealed prescription and over-the-counter pharmaceuticals in original blister packaging or sealed bottles with at least 60 days of remaining shelf life. Examples include antibiotics, cardiovascular drugs, analgesics, chronic care meds, and pediatric vitamins.",
  },
  {
    category: "Donation",
    question: "What medicines are strictly rejected?",
    answer:
      "We strictly reject opened bottles, loose pills, expired drugs, temperature-sensitive refrigerated items requiring specialized cold-chains (such as insulin unless donated directly by certified institutional partners), controlled narcotics, and medicines without legible batch numbers or expiry dates.",
  },
  {
    category: "Verification",
    question: "How does AI verification work on VitaMend?",
    answer:
      "Donors upload a clear photo of the medicine packaging. Our computer vision OCR model extracts the medicine name, dosage, batch number, NDC code, and expiry date in real time, cross-checking them against national pharmaceutical safety ledgers and recall registries.",
  },
  {
    category: "Verification",
    question: "Who verifies the medicines before redistribution?",
    answer:
      "Every AI-flagged or scanned medicine lot undergoes mandatory secondary verification by licensed volunteer pharmacists before being cleared for clinic allocation and public store availability.",
  },
  {
    category: "Safety",
    question: "How are expired or rejected medicines disposed of safely?",
    answer:
      "Items failing safety checks or falling past their expiration date are routed to authorized eco-friendly medical waste disposal partners adhering to Central Pollution Control Board (CPCB) and CDSCO biohazard safe disposal protocols.",
  },
  {
    category: "Logistics",
    question: "How do community health clinics receive donated medicines?",
    answer:
      "Partner clinics submit priority shortage requests through our live Clinic Portal. Verified inventory is automatically matched and routed based on geographic proximity, deficit severity, and clinic verification credentials.",
  },
  {
    category: "Logistics",
    question: "Can I schedule a doorstep pickup for my donation?",
    answer:
      "Yes! Individual donors and institutional partners with 5 or more units can schedule doorstep pickups via our pickup routing system in supported metropolitan cities.",
  },
  {
    category: "Logistics",
    question: "Which cities are currently supported for doorstep collection?",
    answer:
      "Doorstep pickup is currently live across Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, and Pune. Donors outside these cities can drop off packages at partner clinic drop-boxes or mail them via prepaid logistics labels.",
  },
  {
    category: "Safety",
    question: "How is donor and patient privacy maintained?",
    answer:
      "All uploaded label images undergo automatic AI redaction to erase personal prescription labels, donor names, or pharmacy address stickers prior to ledger storage. Data is transmitted over 256-bit SSL encryption.",
  },
];

export function FAQSection({
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know about medicine donation, AI verification, and safe redistribution.",
  faqs = defaultFAQs,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  faqs?: FAQItem[];
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto ${className}`}>
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E492B]/10 text-[#3E492B] text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" /> FAQ Knowledge Base
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#3E492B] tracking-tight">{title}</h2>
        <p className="text-sm sm:text-base text-[#3E492B]/80 max-w-2xl mx-auto font-sans">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.question}
              className="rounded-xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-serif text-lg font-medium text-[#3E492B] hover:text-[#3E492B]/80 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3">
                  {faq.category && (
                    <span className="text-[10px] font-sans font-mono uppercase tracking-wider bg-[#F5F2EC] text-[#3E492B]/70 px-2 py-0.5 rounded border border-[#DDD8CF] shrink-0">
                      {faq.category}
                    </span>
                  )}
                  <span>{faq.question}</span>
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#3E492B]/60 shrink-0 transition-transform duration-300 ${
                    isOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-sm text-[#3E492B]/80 font-sans leading-relaxed border-t border-[#DDD8CF]/40 bg-[#F5F2EC]/30 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center pt-8 border-t border-[#DDD8CF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#3E492B]/70">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700" /> Have more questions? Contact our medical safety board.
        </span>
        <a
          href="mailto:contact@vitamend.in"
          className="font-medium text-[#3E492B] underline hover:text-[#3E492B]/80 transition-colors"
        >
          contact@vitamend.in
        </a>
      </div>
    </section>
  );
}

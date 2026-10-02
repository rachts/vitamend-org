"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
  category?: "Eligibility" | "Verification" | "Recipients" | "Safety";
}

export const defaultFAQs: FAQItem[] = [
  {
    category: "Eligibility",
    question: "What medicines can I donate?",
    answer:
      "We accept un-opened, unexpired medicines in their original manufacturer packaging with at least 60 days of remaining shelf life. This includes sealed blister strips, foil packs, and sealed bottles of antibiotics, chronic care tablets, pain relievers, and vitamins.",
  },
  {
    category: "Eligibility",
    question: "How do I know whether a medicine is eligible?",
    answer:
      "A medicine is eligible if it is unopened, fully sealed, has a clearly legible batch number and expiry date at least 60 days in the future, and is not a controlled substance, narcotic, or unsealed syrup.",
  },
  {
    category: "Verification",
    question: "How are donated medicines checked?",
    answer:
      "When a photo of packaging is uploaded, our OCR system extracts the medicine name, batch number, and expiration date. Licensed pharmacists and verification personnel then physically examine every package to confirm seal integrity, storage condition, and packaging authenticity before intake.",
  },
  {
    category: "Recipients",
    question: "Can I find a specific medicine?",
    answer:
      "Yes. You can search verified surplus stock currently available in the network through our Available Medicines catalog. Certified community health clinics and registered non-profit dispensaries can request batches directly.",
  },
  {
    category: "Recipients",
    question: "Who receives donated medicines?",
    answer:
      "Medicines are routed exclusively to certified non-profit community health clinics, charitable dispensaries, and verified partner healthcare providers who dispense them to underserved patients under medical supervision.",
  },
  {
    category: "Verification",
    question: "What happens after I submit a donation?",
    answer:
      "Your submission is recorded in our review queue with status 'Pending Verification'. A verification volunteer reviews your packaging photos and schedules intake or dropoff. Once verified, the medicine is admitted to available inventory and matched with clinic shortages.",
  },
  {
    category: "Safety",
    question: "Does VitaMend provide medical advice?",
    answer:
      "No. VitaMend is a non-profit logistics and redistribution technology platform. VitaMend is not a pharmacy and does not provide medical advice, diagnosis, prescribing, or clinical consultation. Patients must always consult a licensed doctor or pharmacist.",
  },
];

export function FAQSection({
  title = "Frequently Asked Questions",
  subtitle = "Common questions regarding medicine eligibility, verification standards, and clinic allocation.",
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
    <section className={`py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto ${className}`}>
      <div className="text-center space-y-3 mb-10">
        <h2 className="text-3xl sm:text-4xl font-serif text-[#1C1A14]">{title}</h2>
        <p className="text-sm sm:text-base text-[#5C5545] max-w-xl mx-auto font-sans">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.question}
              className="rounded-md border border-[#D8D2C4] bg-white overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-serif text-lg text-[#1C1A14] hover:text-[#2C3320] transition-colors"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3">
                  {faq.category && (
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-[#F5F2EC] text-[#5C5545] px-2 py-0.5 rounded border border-[#D8D2C4] shrink-0">
                      {faq.category}
                    </span>
                  )}
                  <span>{faq.question}</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#5C5545] shrink-0 transition-transform duration-200 ${
                    isOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-sm text-[#5C5545] font-sans leading-relaxed border-t border-[#D8D2C4] bg-[#F5F2EC]/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center pt-6 border-t border-[#D8D2C4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C5545]">
        <span>Have questions not answered here?</span>
        <a
          href="mailto:contact@vitamend.in"
          className="font-medium text-[#1C1A14] underline hover:text-[#2C3320] transition-colors"
        >
          contact@vitamend.in
        </a>
      </div>
    </section>
  );
}

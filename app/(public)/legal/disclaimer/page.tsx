import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Medical Disclaimer | VitaMend Healthcare Foundation",
  description: "Official medical disclaimer regarding pharmaceutical redistribution, prescription drug policies, and healthcare guidance.",
};

export default function MedicalDisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3E492B] font-sans pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-3xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-12 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E492B]/10 text-[#3E492B] text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" /> Legal & Clinical Guidance
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#3E492B]">
            Medical & Healthcare Disclaimer
          </h1>
          <p className="text-xs font-mono text-[#3E492B]/70">Effective Date: January 1, 2026</p>
        </div>

        <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-10 space-y-6 text-sm text-[#3E492B]/80 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-serif font-medium text-[#3E492B]">1. Non-Medical Advice</h2>
            <p>
              The information, software algorithms, label OCR extraction results, and content provided on VitaMend are for educational, operational, and non-profit logistics routing purposes only. VitaMend does not provide direct medical advice, diagnosis, or treatment recommendations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-medium text-[#3E492B]">2. Prescription Drug Dispensing Protocol</h2>
            <p>
              VitaMend acts solely as a non-profit technology bridge for non-expired surplus pharmaceuticals. All prescription medications listed or redistributed through our network are available exclusively to certified partner health clinics and licensed healthcare practitioners. Direct distribution of prescription pharmaceuticals to individual consumers without a valid medical prescription is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-medium text-[#3E492B]">3. Verification & Pharmacist Oversight</h2>
            <p>
              While VitaMend employs state-of-the-art computer vision OCR scanning and secondary human verification by licensed volunteer pharmacists, recipient clinics remain responsible for inspecting physical pharmaceuticals prior to patient dispensing in accordance with CDSCO guidelines.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-medium text-[#3E492B]">4. Emergency Healthcare Disclaimer</h2>
            <p>
              VitaMend is not an emergency medical service. If you are experiencing a life-threatening medical emergency, please call your local emergency health service (102 / 112 in India) or visit the nearest hospital emergency room immediately.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

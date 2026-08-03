import type { Metadata } from "next";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "OCR Data Handling & Privacy Consent Policy | VitaMend",
  description: "Official computer vision OCR image processing privacy, patient data redaction, and encryption protocols.",
};

export default function OCRDataPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3E492B] font-sans pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-3xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-12 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E492B]/10 text-[#3E492B] text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-4 h-4 text-amber-800" /> Data Protection Standard
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#3E492B]">
            OCR Computer Vision Data Handling & Consent Policy
          </h1>
          <p className="text-xs font-mono text-[#3E492B]/70">Encryption Protocol: AES-256 / SSL 256-bit</p>
        </div>

        <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-10 space-y-6 text-sm text-[#3E492B]/80 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-serif font-medium text-[#3E492B]">1. Image OCR Data Extraction Scope</h2>
            <p>
              When a donor or volunteer uploads a photograph of pharmaceutical packaging, our optical character recognition (OCR) model extracts exclusively technical inventory metrics: medicine brand name, generic formulation, dosage strength, batch number, lot number, and printed expiration date.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-medium text-[#3E492B]">2. Automatic Patient Redaction</h2>
            <p>
              Our machine learning pre-processing pipeline automatically identifies and redacts any personal identifying information (PII) appearing on pharmacy prescription labels, including patient names, physician names, prescription numbers, and retail pharmacy street addresses.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-medium text-[#3E492B]">3. Data Retention & Cryptographic Storage</h2>
            <p>
              Raw image uploads are stored in encrypted cloud object storage buckets for a maximum of 30 days during verification processing, after which images are permanently purged. Extracted inventory metadata is hashed and recorded in our cryptographic ledger.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

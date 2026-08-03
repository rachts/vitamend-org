import type { Metadata } from "next";
import { Leaf } from "lucide-react";

export const metadata: Metadata = {
  title: "Environmental & Safe Medicine Disposal Policy | VitaMend",
  description: "Official biohazard waste disposal and environmental safety protocols adhering to CPCB and CDSCO directives.",
};

export default function SafeDisposalPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3E492B] font-sans pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-3xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-12 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E492B]/10 text-[#3E492B] text-xs font-semibold uppercase tracking-wider">
            <Leaf className="w-4 h-4 text-teal-700" /> Environmental Protection Standard
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#3E492B]">
            Safe Biohazard & Expired Medicine Disposal Policy
          </h1>
          <p className="text-xs font-mono text-[#3E492B]/70">CPCB Directive Compliance Ref: #CPCB-WM-2026</p>
        </div>

        <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-10 space-y-6 text-sm text-[#3E492B]/80 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-serif font-medium text-[#3E492B]">1. Zero Groundwater Contamination Commitment</h2>
            <p>
              Flushing unused or expired pharmaceuticals down drains or disposing of them in municipal landfills poses grave risks to aquatic ecosystems and contributes to antimicrobial resistance (AMR). VitaMend guarantees that 100% of rejected or expired intake lots are kept out of municipal waste streams.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-medium text-[#3E492B]">2. CPCB Biohazard Incineration Standards</h2>
            <p>
              Expired or unverified pharmaceuticals collected by our logistics networks are segregated and handed over exclusively to state-authorized Common Bio-medical Waste Treatment Facilities (CBWTFs). Disposal is executed via high-temperature incineration (&gt;1100°C) with continuous flue-gas monitoring compliant with Bio-medical Waste Management Rules.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-medium text-[#3E492B]">3. Carbon Offsetting & CO₂ Reduction Tracking</h2>
            <p>
              By redistributing non-expired surplus pharmaceuticals to primary health clinics, VitaMend avoids the carbon footprint required to manufacture new pharmaceutical active ingredients. Every unit redistributed is logged to calculate verified CO₂ savings.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

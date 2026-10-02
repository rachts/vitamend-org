import React from "react";
import Link from "next/link";
import { FAQSection } from "@/components/faq";
import { TrustBadgesGroup } from "@/components/trust-badges";
import { LiveDemo } from "@/components/live-demo";
import { Shield, Activity, Building2, UploadCloud, FileCheck, Network, Truck, ArrowRight } from "lucide-react";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";
import { User } from "@/models/User";
import { Distribution } from "@/models/Distribution";

export default async function HomePage() {
  let medicinesCount = 0;
  let volunteersCount = 0;
  let distributionsCount = 0;

  try {
    await connectMongoose();
    const [meds, vols, dists] = await Promise.all([
      Medicine.countDocuments(),
      User.countDocuments({ role: "volunteer" }),
      Distribution.countDocuments({ status: "delivered" }),
    ]);
    medicinesCount = meds;
    volunteersCount = vols;
    distributionsCount = dists;
  } catch (dbErr) {
    console.warn("Could not fetch real-time homepage metrics from database:", dbErr);
  }

  return (
    <div className="w-full">
      {/* SECTION 1: HERO */}
      <section className="relative w-full bg-[#F5F2EC] border-b border-[#D8D2C4] pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h1 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1A14] font-normal leading-[1.1]">
              Donate Unused Medicines to Community Clinics
            </h1>

            <p className="font-sans text-base sm:text-lg text-[#5C5545] max-w-xl leading-relaxed">
              VitaMend scans packaging labels, verifies unexpired sealed medicines, and connects surplus pharmaceuticals with verified non-profit clinics and dispensaries across India.
            </p>

            <div className="pt-1">
              <TrustBadgesGroup />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/donate" className="bg-[#2C3320] text-white px-5 py-3 rounded-md text-sm font-medium hover:bg-[#3D4A2E] transition-colors flex items-center gap-2">
                Donate a Medicine <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/store" className="bg-white border border-[#D8D2C4] text-[#1C1A14] px-5 py-3 rounded-md text-sm font-medium hover:bg-[#EDE9DF] transition-colors">
                View Available Medicines
              </Link>
              <Link href="/volunteer" className="bg-white border border-[#D8D2C4] text-[#1C1A14] px-5 py-3 rounded-md text-sm font-medium hover:bg-[#EDE9DF] transition-colors">
                Register as Volunteer
              </Link>
              <Link href="/clinics" className="bg-white border border-[#D8D2C4] text-[#1C1A14] px-5 py-3 rounded-md text-sm font-medium hover:bg-[#EDE9DF] transition-colors">
                Partner Health Clinics
              </Link>
            </div>

            {/* Tracked Operational Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-12 mt-6 border-t border-[#D8D2C4]">
              <div className="flex flex-col">
                <span className="font-serif text-3xl sm:text-4xl text-[#1C1A14] font-medium leading-none">
                  {medicinesCount > 0 ? medicinesCount.toLocaleString() : "0"}
                </span>
                <span className="font-sans text-xs uppercase tracking-wider text-[#5C5545] mt-2">
                  Medicines Registered
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-3xl sm:text-4xl text-[#1C1A14] font-medium leading-none">
                  {distributionsCount > 0 ? distributionsCount.toLocaleString() : "0"}
                </span>
                <span className="font-sans text-xs uppercase tracking-wider text-[#5C5545] mt-2">
                  Delivered Shipments
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-3xl sm:text-4xl text-[#1C1A14] font-medium leading-none">
                  {volunteersCount > 0 ? volunteersCount.toLocaleString() : "0"}
                </span>
                <span className="font-sans text-xs uppercase tracking-wider text-[#5C5545] mt-2">
                  Active Volunteers
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-[#D8D2C4] rounded-lg p-6 sm:p-8">
            <h2 className="font-serif text-xl text-[#1C1A14] mb-3">Medicine Eligibility Quick Check</h2>
            <ul className="space-y-3 text-xs sm:text-sm text-[#5C5545] mb-6">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>Unopened, factory-sealed blister packs, foil strips, or bottles.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>Minimum 60 days remaining before manufacturer expiry date.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>Clear batch numbers and manufacturing details.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✕</span>
                <span>No opened syrups, loose tablets, or controlled narcotics.</span>
              </li>
            </ul>
            <Link
              href="/donor-guide"
              className="inline-block text-xs font-medium text-[#2C3320] underline hover:text-[#3D4A2E]"
            >
              Read complete donation standards and medicine safety guide →
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: LIVE OCR DEMO */}
      <section className="w-full bg-[#EDE9DF] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#D8D2C4]">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center">
          <div className="mb-10 text-center max-w-2xl">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1A14] mb-3">
              Test Medicine Packaging Label Scanning
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#5C5545]">
              Upload a photograph of medicine packaging. Our OCR pipeline extracts the brand name, batch code, and expiry date for pharmacist review.
            </p>
          </div>
          <div className="w-full">
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW VITAMEND REDISTRIBUTES MEDICINE */}
      <section className="w-full bg-[#F5F2EC] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#D8D2C4]">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center">
          <div className="mb-14 text-center max-w-2xl">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1A14] mb-3">
              How the Redistribution Process Works
            </h2>
            <p className="text-sm sm:text-base text-[#5C5545]">
              Every donated medicine follows a verifiable audit trail from donor submission to clinic dispensing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {[
              {
                step: "Step 01",
                title: "Donor Submission",
                desc: "Donors upload packaging photographs and enter medicine information, batch details, and pickup location.",
                icon: <UploadCloud size={40} className="text-[#2C3320]" strokeWidth={1.5} />,
              },
              {
                step: "Step 02",
                title: "Pharmacist Verification",
                desc: "Licensed pharmacists and volunteers inspect packaging photos and physical seals against safety standards.",
                icon: <FileCheck size={40} className="text-[#2C3320]" strokeWidth={1.5} />,
              },
              {
                step: "Step 03",
                title: "Clinic Allocation",
                desc: "Verified stock is matched against documented shortages submitted by certified community health clinics.",
                icon: <Network size={40} className="text-[#2C3320]" strokeWidth={1.5} />,
              },
              {
                step: "Step 04",
                title: "Logistics and Delivery",
                desc: "Shipments are dispatched with delivery manifests, ensuring safe custody until handed to certified medical staff.",
                icon: <Truck size={40} className="text-[#2C3320]" strokeWidth={1.5} />,
              },
            ].map((card, i) => (
              <div key={i} className="bg-white border border-[#D8D2C4] rounded-lg p-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-md bg-[#EDE9DF] flex items-center justify-center">
                  {card.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs text-[#5C5545] uppercase tracking-wider">
                    {card.step}
                  </span>
                  <h3 className="font-serif text-xl text-[#1C1A14]">
                    {card.title}
                  </h3>
                  <p className="font-sans text-sm text-[#5C5545] leading-relaxed mt-1">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/donate" className="bg-[#2C3320] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[#3D4A2E] transition-colors flex items-center gap-2">
              Donate a Medicine <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/donor-guide" className="bg-white border border-[#D8D2C4] text-[#1C1A14] px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[#EDE9DF] transition-colors">
              Read Donor Guide
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: SAFETY & STANDARDS */}
      <section className="w-full bg-[#F5F2EC] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#D8D2C4]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3 border-t border-[#D8D2C4] pt-6">
            <Shield size={24} className="text-[#2C3320]" />
            <h3 className="font-serif text-lg text-[#1C1A14]">
              Mandatory Expiry Screening
            </h3>
            <p className="font-sans text-sm text-[#5C5545] leading-relaxed">
              Medicines expiring within 60 days are systematically excluded from intake to guarantee sufficient dispensing life for partner clinics.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#D8D2C4] pt-6">
            <Activity size={24} className="text-[#2C3320]" />
            <h3 className="font-serif text-lg text-[#1C1A14]">
              Licensed Clinic Allocation
            </h3>
            <p className="font-sans text-sm text-[#5C5545] leading-relaxed">
              Prescription pharmaceuticals are never dispensed directly to individual consumers. All stock flows through certified healthcare clinics.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#D8D2C4] pt-6">
            <Building2 size={24} className="text-[#2C3320]" />
            <h3 className="font-serif text-lg text-[#1C1A14]">
              Safe Biohazard Disposal
            </h3>
            <p className="font-sans text-sm text-[#5C5545] leading-relaxed">
              Damaged, broken seal, or recalled batches are routed to licensed biomedical waste facilities in accordance with CPCB environmental directives.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: FAQS */}
      <FAQSection />

      {/* SECTION 6: ACTION CALLOUT BANNER */}
      <section className="w-full bg-[#F5F2EC] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1100px] mx-auto rounded-lg border border-[#D8D2C4] bg-[#2C3320] text-white p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-serif font-medium">
            Support Community Medicine Redistribution
          </h2>
          <p className="text-sm sm:text-base text-[#EDE9DF] max-w-xl mx-auto font-sans leading-relaxed">
            Donate unopened surplus medications, register as a volunteer verification partner, or submit clinic inventory requests.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/donate" className="bg-white text-[#2C3320] hover:bg-[#F5F2EC] px-5 py-2.5 rounded-md text-sm font-medium transition-colors">
              Donate a Medicine
            </Link>
            <Link href="/volunteer" className="border border-white/40 text-white hover:bg-white/10 px-5 py-2.5 rounded-md text-sm font-medium transition-colors">
              Register as Volunteer
            </Link>
            <Link href="/clinics" className="border border-white/40 text-white hover:bg-white/10 px-5 py-2.5 rounded-md text-sm font-medium transition-colors">
              Partner Clinic Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

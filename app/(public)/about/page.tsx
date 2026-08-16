import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FAQSection } from "@/components/faq";
import { TrustBadge, TrustBadgesGroup } from "@/components/trust-badges";
import {
  ShieldCheck,
  Award,
  Heart,
  Target,
  Users,
  Building2,
  Cpu,
  UserCheck,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About VitaMend | Mission, Team & Healthcare Governance",
  description:
    "Learn about VitaMend's AI-driven pharmaceutical redistribution platform, our leadership team, medical advisory board, and CDSCO compliance standards.",
};

const leadershipTeam = [
  {
    name: "Rachit Tiwari",
    role: "Founder",
    bio: "Building VitaMend to bridge surplus medicine and underserved clinics through AI-powered verification.",
    image: "/founder_new.jpg",
  },
  {
    name: "Nandini Dubey",
    role: "Co-Founder & CTO",
    bio: "Architecting the AI OCR verification pipeline and platform infrastructure.",
    image: "/images/nandini.jpeg",
  },
  // REMOVE: Dr. Rajesh K. Sharma, Meera Subramaniam (unverified)
];

const medicalAdvisors: { name: string; specialty: string; institution: string }[] = [
  // EMPTY until signed advisory agreements are in place.
  // DO NOT add fake names or unverified institutional affiliations.
];

const partnerOrganizations: { name: string; category: string; badge: string }[] = [
  // REMOVE: Fortis Healthcare Network, Red Cross Medical Aid, CDSCO Guidelines Group
  // Only add organizations after written partnership agreements exist.
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3E492B] font-sans pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="rounded-3xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-12 shadow-sm space-y-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E492B]/10 text-[#3E492B] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#3E492B]" /> About VitaMend Foundation
          </div>

          <h1 className="text-3xl sm:5xl font-serif font-medium tracking-tight text-[#3E492B]">
            Redefining the Lifecycle of Care.
          </h1>

          <p className="text-base sm:text-lg text-[#3E492B]/80 leading-relaxed font-sans max-w-2xl mx-auto">
            VitaMend is India&apos;s first AI-powered pharmaceutical redistribution platform. We bridge the gap between un-opened surplus medicine and underserved community health clinics.
          </p>

          <div className="pt-2 flex justify-center">
            <TrustBadgesGroup />
          </div>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#3E492B] text-white flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-medium text-[#3E492B]">Our Mission</h2>
            <p className="text-sm text-[#3E492B]/80 leading-relaxed">
              To eradicate preventable pharmaceutical waste and eliminate critical medicine shortages in primary health centers through automated computer vision verification and transparent logistics routing.
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#3E492B] text-white flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-medium text-[#3E492B]">Our Vision</h2>
            <p className="text-sm text-[#3E492B]/80 leading-relaxed">
              A healthcare ecosystem where no usable, non-expired medicine is ever incinerated or discarded while a patient goes untreated due to stockouts.
            </p>
          </div>
        </div>

        {/* Story & Core Values */}
        <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-10 space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
              ORIGIN STORY
            </span>
            <h2 className="text-3xl font-serif font-medium text-[#3E492B]">Why We Built VitaMend</h2>
            <p className="text-sm sm:text-base text-[#3E492B]/80 leading-relaxed">
              Every year, over ₹5,000 Crore worth of un-opened, non-expired pharmaceuticals are discarded in urban hubs, while thousands of rural community health centers face critical deficits of essential antibiotics and chronic care medications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#DDD8CF]">
            <div className="space-y-2">
              <h4 className="font-serif text-lg font-medium text-[#3E492B]">1. Safety First</h4>
              <p className="text-xs text-[#3E492B]/70 leading-relaxed">
                Multi-layer verification combining AI OCR scanning with mandatory licensed pharmacist sign-offs.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-serif text-lg font-medium text-[#3E492B]">2. Full Transparency</h4>
              <p className="text-xs text-[#3E492B]/70 leading-relaxed">
                Cryptographically verifiable ledger ensuring every donated blister pack can be traced to its recipient clinic.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-serif text-lg font-medium text-[#3E492B]">3. Zero Biohazard Waste</h4>
              <p className="text-xs text-[#3E492B]/70 leading-relaxed">
                Expired or invalid items are safely routed to authorized CPCB incineration partners.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Workflow Diagram */}
        <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-10 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
              SECURITY ARCHITECTURE
            </span>
            <h2 className="text-3xl font-serif font-medium text-[#3E492B]">4-Step Safety Verification Workflow</h2>
            <p className="text-xs sm:text-sm text-[#3E492B]/80">
              How we guarantee 100% authenticity and medical safety from donor intake to clinic dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {[
              { step: "01", title: "Donor Label Scan", desc: "Computer vision OCR extracts medicine name, batch, and expiry date.", icon: Cpu },
              { step: "02", title: "Safety Cross-Check", desc: "Automated query against national drug recall ledgers & CDSCO alerts.", icon: ShieldCheck },
              { step: "03", title: "Pharmacist Sign-Off", desc: "Licensed pharmacist reviews physical packaging integrity & batch lot.", icon: UserCheck },
              { step: "04", title: "Priority Dispatch", desc: "Automated routing to verified clinics based on deficit urgency.", icon: Building2 },
            ].map((s) => (
              <div key={s.step} className="p-5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#3E492B] bg-white px-2 py-0.5 rounded border border-[#DDD8CF]">
                    STEP {s.step}
                  </span>
                  <s.icon className="w-5 h-5 text-[#3E492B]/70" />
                </div>
                <h4 className="font-serif text-base font-medium text-[#3E492B]">{s.title}</h4>
                <p className="text-xs text-[#3E492B]/70 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <div id="team" className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
              LEADERSHIP & OPERATIONS
            </span>
            <h2 className="text-3xl font-serif font-medium text-[#3E492B]">Meet Our Team</h2>
            <p className="text-sm text-[#3E492B]/80 max-w-xl mx-auto">
              Engineers, pharmacists, and health policy advocates committed to equitable care distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadershipTeam.map((member) => (
              <div key={member.name} className="rounded-xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#F5F2EC] border border-[#DDD8CF] flex items-center justify-center">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={300}
                        height={300}
                        unoptimized
                        className="w-full h-full object-cover grayscale-[40%] hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Users className="w-10 h-10 mx-auto text-[#3E492B]/40 mb-1" />
                        <span className="text-xs font-mono text-[#3E492B]/60">VERIFIED LEAD</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#3E492B]">{member.name}</h3>
                    <p className="text-xs font-mono font-medium text-[#3E492B]/70 mt-0.5">{member.role}</p>
                  </div>

                  <p className="text-xs text-[#3E492B]/80 leading-relaxed">{member.bio}</p>
                </div>

                <div className="pt-3 border-t border-[#DDD8CF]/60 flex items-center justify-between text-[10px] font-mono text-[#3E492B]/70">
                  <span>STATUS: ACTIVE</span>
                  <TrustBadge variant="pharmacist" size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Advisory Board & Partners */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Medical Advisors */}
          <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 space-y-6">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
                CLINICAL ADVISORY
              </span>
              <h3 className="text-2xl font-serif font-medium text-[#3E492B] mt-1">Medical Advisory Board</h3>
            </div>

            <div className="space-y-4">
              {medicalAdvisors.length === 0 ? (
                <div className="p-4 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 text-xs text-[#3E492B]/70 italic">
                  Advisory panel onboarding in progress. Formal advisory agreements are currently being finalized.
                </div>
              ) : (
                medicalAdvisors.map((adv) => (
                  <div key={adv.name} className="p-4 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 space-y-1">
                    <h4 className="font-serif text-base font-medium text-[#3E492B]">{adv.name}</h4>
                    <p className="text-xs text-[#3E492B]/80">{adv.specialty}</p>
                    <p className="text-[11px] font-mono text-[#3E492B]/60">{adv.institution}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Partner Organizations */}
          <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 space-y-6">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
                ECOSYSTEM PARTNERS
              </span>
              <h3 className="text-2xl font-serif font-medium text-[#3E492B] mt-1">Partner Networks</h3>
            </div>

            <div className="space-y-4">
              {partnerOrganizations.length === 0 ? (
                <div className="p-4 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 text-xs text-[#3E492B]/70 italic">
                  Partner hospital and NGO networks onboarding under formal MoUs.
                </div>
              ) : (
                partnerOrganizations.map((org) => (
                  <div key={org.name} className="p-4 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-serif text-base font-medium text-[#3E492B]">{org.name}</h4>
                      <p className="text-xs text-[#3E492B]/70">{org.category}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-white px-2.5 py-1 rounded border border-[#DDD8CF] text-[#3E492B]/80 shrink-0">
                      {org.badge}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Registration & Legal Compliance Details */}
        <div id="cdsco" className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDD8CF]">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
                REGULATORY STANDARDS
              </span>
              <h3 className="text-2xl font-serif font-medium text-[#3E492B] mt-1">Legal Registration & Compliance</h3>
            </div>
            <TrustBadge variant="cdsco" size="lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#3E492B]/80">
            <div className="space-y-2">
              <h4 className="font-serif text-base font-medium text-[#3E492B] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#3E492B]" /> NGO Registration
              </h4>
              <p className="leading-relaxed">
                An initiative working toward Section 8 non-profit registration under the Indian Companies Act, 2013.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-base font-medium text-[#3E492B] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#3E492B]" /> CDSCO & CPCB Guidelines
              </h4>
              <p className="leading-relaxed">
                Redistribution protocols adhere strictly to Central Drugs Standard Control Organization (CDSCO) non-prescription surplus handling rules and CPCB biohazard safe disposal directives.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection />

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl border border-[#DDD8CF] bg-[#3E492B] text-white p-8 sm:p-12 text-center space-y-6 shadow-md">
          <h2 className="text-3xl sm:text-4xl font-serif font-medium">Join the Care Redistribution Network</h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-sans">
            Whether you are an individual donor, licensed pharmacist, or community clinic, your involvement saves lives.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/donate" className="btn-primary bg-white text-[#3E492B] hover:bg-white/90 px-6 py-3 text-xs">
              Donate Surplus Medicine <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/volunteer" className="btn-secondary border-white/40 text-white hover:bg-white/10 px-6 py-3 text-xs">
              Become a Volunteer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { FAQSection } from "@/components/faq";
import { TestimonialsSection } from "@/components/testimonials";
import { TrustBadgesGroup } from "@/components/trust-badges";
import { LiveDemo } from "@/components/live-demo";
import { Shield, Activity, Grid, UploadCloud, FileCheck, Network, Truck, ArrowRight } from "lucide-react";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";
import { User } from "@/models/User";

export default async function HomePage() {
  await connectMongoose();
  const [medicinesDonated, distributedMedicines, volunteers] = await Promise.all([
    Medicine.countDocuments(),
    Medicine.countDocuments({ status: "distributed" }),
    User.countDocuments({ role: "volunteer" }),
  ]);
  const peopleHelped = distributedMedicines > 0 ? distributedMedicines * 2 : medicinesDonated * 1.5;

  return (
    <div className="w-full">
      {/* SECTION 1: HERO */}
      <section className="relative w-full min-h-[90vh] flex flex-col justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1593113565637-251f28b43bd1?q=80&w=2069&auto=format&fit=crop")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            background: "linear-gradient(to right, var(--bg-primary) 45%, transparent 100%)",
          }}
        />

        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 pt-32 pb-16">
          <div className="w-full md:w-[55%] flex flex-col gap-6">
            <div className="fade-in">
              <h1 className="font-serif text-[var(--text-hero)] text-[var(--text-primary)] font-normal leading-[1.1]">
                Donate Medicines.<br />Save Lives.
              </h1>
            </div>



            <div className="fade-in">
              <p className="font-sans text-[var(--text-body)] text-[var(--text-secondary)] max-w-[480px] leading-[1.7]">
                VitaMend scans medicine labels, verifies expiry dates, and safely routes surplus stock to clinics reporting shortages.
                Join us in redefining the lifecycle of care.
              </p>
            </div>

            <div className="fade-in">
              <div className="pt-1">
                <TrustBadgesGroup />
              </div>
            </div>

            <div className="fade-in">
              <div className="flex flex-wrap items-center gap-[12px] pt-2">
                <Link href="/donate" className="btn-primary">
                  Donate Medicines &rarr;
                </Link>
                <Link href="/volunteer" className="btn-ghost">
                  Become a Volunteer
                </Link>
                <Link href="/store" className="btn-ghost">
                  Browse Store
                </Link>
                <Link href="/clinics" className="btn-ghost">
                  Clinic Portal
                </Link>
              </div>
            </div>

            {/* Stats Strip */}
            <div className="fade-in grid grid-cols-3 gap-6 pt-16 mt-8 border-t border-[var(--border)]">
              <div className="flex flex-col">
                <span className="font-serif text-[var(--text-stat)] text-[var(--stat-number)] leading-none">
                  {medicinesDonated.toLocaleString()}
                </span>
                <span className="font-sans text-[var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)] mt-2">
                  Medicines Donated
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-[var(--text-stat)] text-[var(--stat-number)] leading-none">
                  {peopleHelped.toLocaleString()}
                </span>
                <span className="font-sans text-[var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)] mt-2">
                  People Helped
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-[var(--text-stat)] text-[var(--stat-number)] leading-none">
                  {volunteers.toLocaleString()}
                </span>
                <span className="font-sans text-[var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)] mt-2">
                  Volunteers
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1.5: LIVE DEMO */}
      <section className="w-full bg-[var(--bg-secondary)] py-[clamp(80px,10vw,140px)] px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center">
          <div className="fade-in mb-12 text-center max-w-3xl">
            <h2 className="font-serif text-[var(--text-h2)] text-[var(--text-primary)] mb-4">
              Try the AI Safety Scanner
            </h2>
            <p className="font-sans text-[1.1rem] text-[var(--text-secondary)]">
              Upload a photo of a medicine label. Our AI will instantly extract details, detect tampering, verify expiry dates, and flag safety concerns—before human pharmacists review it.
            </p>
          </div>
          <div className="w-full">
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW VITAMEND WORKS */}
      <section className="w-full bg-[var(--bg-primary)] py-[clamp(80px,10vw,140px)] px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center">
          <div className="fade-in">
            <h2 className="font-serif text-[var(--text-h2)] text-[var(--text-primary)] text-center mb-16">
              How VitaMend Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {[
              {
                step: "01. Initiate",
                stepColor: "text-[var(--accent-rust)]",
                title: "Donate",
                desc: "Upload photos of your surplus medicines. Our AI extracts details instantly.",
                icon: <UploadCloud size={64} className="text-[var(--text-primary)]" strokeWidth={1} />,
              },
              {
                step: "02. Authenticate",
                stepColor: "text-[var(--accent-rust)]",
                title: "Verify",
                desc: "Pharmacists cross-reference AI data to ensure strict quality and expiry compliance.",
                icon: <FileCheck size={64} className="text-[var(--text-primary)]" strokeWidth={1} />,
              },
              {
                step: "03. Route",
                stepColor: "text-[var(--text-muted)]",
                title: "Connect",
                desc: "Algorithms match verified inventory to regional clinics reporting critical shortages.",
                icon: <Network size={64} className="text-[var(--text-primary)]" strokeWidth={1} />,
              },
              {
                step: "04. Deliver",
                stepColor: "text-[var(--text-muted)]",
                title: "Impact",
                desc: "Our volunteer network ensures secure, fast, and free last-mile delivery to patients.",
                icon: <Truck size={64} className="text-[var(--text-primary)]" strokeWidth={1} />,
              },
            ].map((card, i) => (
              <div key={i} className="fade-in">
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group">
                  <div className="h-48 w-full bg-[var(--bg-secondary)] flex items-center justify-center transition-transform duration-500 group-hover:bg-[var(--bg-card)]">
                    {card.icon}
                  </div>
                  <div className="p-[2rem] flex flex-col gap-3">
                    <span className={`font-sans text-[var(--text-label)] uppercase tracking-[var(--tracking-label)] ${card.stepColor}`}>
                      {card.step}
                    </span>
                    <h3 className="font-serif text-[1.6rem] text-[var(--text-primary)]">
                      {card.title}
                    </h3>
                    <p className="font-sans text-[0.9rem] text-[var(--text-secondary)] leading-[1.6]">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="fade-in mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/donate" className="btn-primary flex items-center gap-2">
              Start Medicine Scan <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/donor-guide" className="btn-ghost">
              Read Donor Guide
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: VALUE PROPS */}
      <section className="w-full bg-[var(--bg-primary)] pb-[clamp(80px,10vw,140px)] px-6">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="fade-in">
            <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-8">
              <Shield size={28} className="text-[var(--text-primary)]" />
              <h3 className="font-serif text-[1.4rem] text-[var(--text-primary)] mt-2">
                AI Verification
              </h3>
              <p className="font-sans text-[0.9rem] text-[var(--text-secondary)] leading-relaxed">
                Our optical character recognition ensures no expired or recalled batches ever enter the network.
              </p>
            </div>
          </div>

          <div className="fade-in">
            <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-8">
              <Activity size={28} className="text-[var(--text-primary)]" />
              <h3 className="font-serif text-[1.4rem] text-[var(--text-primary)] mt-2">
                Direct Impact
              </h3>
              <p className="font-sans text-[0.9rem] text-[var(--text-secondary)] leading-relaxed">
                By bypassing bureaucratic delays, we route medications directly to under-stocked rural and urban clinics.
              </p>
            </div>
          </div>

          <div className="fade-in">
            <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-8">
              <Grid size={28} className="text-[var(--text-primary)]" />
              <h3 className="font-serif text-[1.4rem] text-[var(--text-primary)] mt-2">
                Trusted Network
              </h3>
              <p className="font-sans text-[0.9rem] text-[var(--text-secondary)] leading-relaxed">
                Partnering exclusively with CDSCO-licensed pharmacists to maintain the highest standards of safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: TESTIMONIALS */}
      <TestimonialsSection />

      {/* SECTION 5: FAQ */}
      <FAQSection />

      {/* SECTION 6: BOTTOM CTA BANNER */}
      <section className="w-full bg-[var(--bg-primary)] py-16 px-6">
        <div className="max-w-[1100px] mx-auto rounded-3xl border border-[#DDD8CF] bg-[#3E492B] text-white p-8 sm:p-12 text-center space-y-6 shadow-md">
          <h2 className="text-3xl sm:text-4xl font-serif font-medium">Ready to Make Healthcare Accessible?</h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-sans">
            Donate your un-opened surplus medicine or join our volunteer team to help bridge the healthcare gap.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/donate" className="btn-primary bg-white text-[#3E492B] hover:bg-white/90 px-6 py-3 text-xs">
              Donate Surplus Medicine <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/volunteer" className="btn-secondary border-white/40 text-white hover:bg-white/10 px-6 py-3 text-xs">
              Become a Volunteer
            </Link>
            <Link href="/clinics" className="btn-secondary border-white/40 text-white hover:bg-white/10 px-6 py-3 text-xs">
              Partner Clinic Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

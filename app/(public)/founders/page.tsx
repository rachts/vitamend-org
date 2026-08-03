import Image from "next/image";
import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "The Founders | Vitamend",
}

export default function FoundersPage() {
  return (
    <div className="w-full">
      <section className="max-w-[1200px] mx-auto px-6 py-24 md:py-32">
        <div className="flex flex-col-reverse md:flex-row gap-12 md:gap-24 items-center">
          
          {/* Left Column: Content */}
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <span className="font-sans text-[var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
              The Founders
            </span>
            <h1 className="font-serif text-[clamp(2.5rem,4vw,3rem)] text-[var(--text-primary)] leading-[1.1]">
              The Founder&apos;s Journey
            </h1>
            <p className="font-sans text-[var(--text-body)] text-[var(--text-secondary)] leading-[1.8] max-w-[480px]">
              Witnessing the stark contrast between medical surplus in well-stocked pharmacies and the struggle for access in underserved communities changed my perspective completely. It wasn&apos;t just a supply chain flaw—it was a missed opportunity to save lives and improve health outcomes.
            </p>
            <p className="font-sans text-[var(--text-body)] text-[var(--text-secondary)] leading-[1.8] max-w-[480px]">
              That realization became the driving force behind Vitamend. We built this platform to seamlessly bridge the gap, using technology to redistribute hope and ensure no usable medicine ever goes to waste. It&apos;s about building a sustainable future where healthcare is accessible to all.
            </p>
          </div>

          {/* Right Column: Image */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <div className="relative w-full max-w-[500px] aspect-[4/5] rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-card)]">
              <Image width={500} height={500} unoptimized 
                src="/founder_new.jpg" 
                alt="Portrait of the Founder"
                className="w-full h-full object-cover grayscale-[50%] hover:grayscale-0 transition-all duration-700 ease-in-out"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Nandini&apos;s Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-12 md:py-24">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center">
          
          {/* Left Column: Image (Alternating) */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-start">
            <div className="relative w-full max-w-[500px] aspect-[4/5] rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-card)]">
              <Image 
                width={500} 
                height={500} 
                unoptimized 
                src="/images/nandini.jpeg" 
                alt="Portrait of Nandini Dubey"
                className="w-full h-full object-cover grayscale-[50%] hover:grayscale-0 transition-all duration-700 ease-in-out"
              />
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <span className="font-sans text-[var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
              Co-Founder
            </span>
            <h2 className="font-serif text-[clamp(2.5rem,4vw,3rem)] text-[var(--text-primary)] leading-[1.1]">
              Nandini&apos;s Vision
            </h2>
            <p className="font-sans text-[var(--text-body)] text-[var(--text-secondary)] leading-[1.8] max-w-[480px]">
              Technology has the power to solve some of the world&apos;s most complex logistical challenges. When looking at the systemic inefficiencies in pharmaceutical distribution, the solution wasn&apos;t just another supply chain tool—it was a platform built on trust, transparency, and impact.
            </p>
            <p className="font-sans text-[var(--text-body)] text-[var(--text-secondary)] leading-[1.8] max-w-[480px]">
              By combining AI-driven verification with an open ledger, we ensure that every contribution is accounted for. Vitamend is designed to scale care, ensuring that surplus medicine securely reaches those who need it most without compromise.
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}

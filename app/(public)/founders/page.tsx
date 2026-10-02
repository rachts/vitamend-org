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
              Witnessing the contrast between medical surplus in urban pharmacies and the shortage in community clinics highlighted an urgent need. Every unexpired medicine discarded is a missed opportunity to save lives and support public health.
            </p>
            <p className="font-sans text-[var(--text-body)] text-[var(--text-secondary)] leading-[1.8] max-w-[480px]">
              That realization became the driving force behind VitaMend. We built this platform to connect surplus supplies directly with clinics in need, using software and pharmacist review to prevent usable medicines from going to waste.
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
              Technology has the power to solve difficult logistical challenges. Resolving pharmaceutical distribution inefficiencies requires software built with transparency, strict verification protocols, and clinic accountability.
            </p>
            <p className="font-sans text-[var(--text-body)] text-[var(--text-secondary)] leading-[1.8] max-w-[480px]">
              By combining machine-assisted OCR verification with licensed pharmacist review, we ensure every donation is accounted for and safe for dispensing.
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}

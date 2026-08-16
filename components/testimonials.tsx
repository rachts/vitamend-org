"use client";

import React, { useState } from "react";
import { Quote, ChevronLeft, ChevronRight, Star, Heart, Building2, UserCheck, HeartHandshake } from "lucide-react";

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  organization?: string;
  category: "Donor" | "Clinic" | "Patient" | "Volunteer";
  impactMetric: string;
}

export const testimonialsData: Testimonial[] = [
  // TODO: Populate with real verified testimonials only.
  // DO NOT ship with fabricated names, credentials, or organizations.
];

export function TestimonialsSection({ className = "" }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (testimonialsData.length === 0) {
    return (
      <section className={`py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto ${className}`}>
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E492B]/10 text-[#3E492B] text-xs font-semibold uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" /> Real Impact Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#3E492B] tracking-tight">
            Voices from the Redistribution Network
          </h2>
          <p className="text-sm sm:text-base text-[#3E492B]/80 max-w-2xl mx-auto font-sans">
            Testimonials from verified donors, pharmacists, and clinics will appear here as the network grows.
          </p>
        </div>
        <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-12 shadow-sm text-center">
          <p className="text-[#3E492B]/60 font-serif italic text-lg">
            Be the first to share your story. Verified testimonials coming soon.
          </p>
        </div>
      </section>
    );
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonialsData.length - 1 : prev - 1));
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev === testimonialsData.length - 1 ? 0 : prev + 1));
  };

  const current = testimonialsData[currentIndex];

  const categoryIcons = {
    Donor: Heart,
    Clinic: Building2,
    Patient: HeartHandshake,
    Volunteer: UserCheck,
  };

  const Icon = categoryIcons[current.category] || Heart;

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto ${className}`}>
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E492B]/10 text-[#3E492B] text-xs font-semibold uppercase tracking-wider">
          <HeartHandshake className="w-4 h-4" /> Real Impact Stories
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#3E492B] tracking-tight">
          Voices from the Redistribution Network
        </h2>
        <p className="text-sm sm:text-base text-[#3E492B]/80 max-w-2xl mx-auto font-sans">
          Hear how donors, volunteer pharmacists, and community clinics unite to eliminate healthcare waste.
        </p>
      </div>

      {/* Testimonial Card Slider */}
      <div className="relative rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-12 shadow-sm">
        <Quote className="w-12 h-12 text-[#3E492B]/20 absolute top-6 left-6" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F2EC] text-[#3E492B] text-xs font-mono border border-[#DDD8CF]">
            <Icon className="w-3.5 h-3.5" /> {current.category} Story
          </div>

          <p className="text-lg sm:text-xl font-serif italic text-[#3E492B] leading-relaxed">
            &ldquo;{current.quote}&rdquo;
          </p>

          <div className="pt-4 border-t border-[#DDD8CF]/60 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-amber-500 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h4 className="font-serif text-lg font-medium text-[#3E492B]">{current.author}</h4>
            <p className="text-xs text-[#3E492B]/70 font-sans">
              {current.role} • <span className="font-medium text-[#3E492B]">{current.organization}</span>
            </p>
            <span className="mt-2 text-xs font-mono font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {current.impactMetric}
            </span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#DDD8CF]/40">
          <button
            onClick={prevTestimonial}
            className="p-2.5 rounded-full border border-[#DDD8CF] bg-white/80 text-[#3E492B] hover:bg-[#F5F2EC] transition-colors"
            aria-label="Previous Testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {testimonialsData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? "w-6 bg-[#3E492B]" : "bg-[#DDD8CF]"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextTestimonial}
            className="p-2.5 rounded-full border border-[#DDD8CF] bg-white/80 text-[#3E492B] hover:bg-[#F5F2EC] transition-colors"
            aria-label="Next Testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

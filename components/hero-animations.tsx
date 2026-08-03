"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

export default function HeroAnimations() {
  const prefersReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || prefersReducedMotion) return null

  return (
    <>
      {/* This component triggers animations via CSS classes applied to data attributes */}
      <style jsx global>{`
        [data-hero-logo] {
          animation: heroLogoAnim 0.6s ease-out forwards;
        }
        [data-hero-title] {
          animation: heroTitleAnim 0.7s ease-out 0.2s forwards;
          opacity: 0;
        }
        [data-hero-subtitle] {
          animation: heroSubtitleAnim 0.6s ease-out 0.35s forwards;
          opacity: 0;
        }
        [data-hero-buttons] > * {
          animation: heroButtonAnim 0.5s ease-out forwards;
          opacity: 0;
        }
        [data-hero-buttons] > *:nth-child(1) { animation-delay: 0.45s; }
        [data-hero-buttons] > *:nth-child(2) { animation-delay: 0.55s; }
        [data-hero-buttons] > *:nth-child(3) { animation-delay: 0.65s; }
        
        [data-stat-card] {
          animation: statCardAnim 0.6s ease-out forwards;
          opacity: 0;
        }
        [data-stat-card]:nth-child(1) { animation-delay: 0.1s; }
        [data-stat-card]:nth-child(2) { animation-delay: 0.2s; }
        [data-stat-card]:nth-child(3) { animation-delay: 0.3s; }
        [data-stat-card]:nth-child(4) { animation-delay: 0.4s; }

        @keyframes heroLogoAnim {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes heroTitleAnim {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroSubtitleAnim {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroButtonAnim {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes statCardAnim {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

export const MotionDiv = motion.div

"use client"

import type React from "react"

import { useEffect, useRef, useCallback } from "react"
import { useInView, type MotionValue, useMotionValue as useFramerMotionValue, animate } from "framer-motion"

export function useMotionAnimate() {
  const prefersReducedMotion = useRef(false)
  const motionValueRef = useRef<MotionValue | null>(null)
  const ReducedMotion = useFramerMotionValue(0) // Initialize useFramerMotionValue at the top level

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  const animateValue = useCallback(
    (
      from: number,
      to: number,
      options: {
        duration?: number
        onUpdate?: (value: number) => void
        onComplete?: () => void
      } = {},
    ) => {
      if (prefersReducedMotion.current) {
        options.onUpdate?.(to)
        options.onComplete?.()
        return { stop: () => {} }
      }

      if (!motionValueRef.current) {
        motionValueRef.current = ReducedMotion // Use the initialized value
      }

      const controls = animate(motionValueRef.current, to, {
        duration: options.duration || 0.6,
        ease: "easeOut",
        onUpdate: options.onUpdate,
        onComplete: options.onComplete,
      })

      return controls
    },
    [],
  )

  return { animateValue, prefersReducedMotion: prefersReducedMotion.current }
}

export function useScrollAnimation(
  options: {
    threshold?: number
    rootMargin?: string
    once?: boolean
  } = {},
) {
  const elementRef = useRef<HTMLElement>(null)
  const isInView = useInView(elementRef as React.RefObject<Element>, {
    amount: options.threshold ?? 0.1,
    once: options.once ?? true,
  })

  return { elementRef, isInView }
}

export function usePageLoadAnimation() {
  // This hook is now a no-op since we use Framer Motion's built-in stagger
  // Components should use motion.div with staggerChildren instead
  return null
}

// Re-export framer-motion utilities for convenience
export { motion, AnimatePresence, useInView } from "framer-motion"

"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"

interface AnimatedCounterProps {
  value: number | string
  suffix?: string
  prefix?: string
  className?: string
  duration?: number
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  className = "",
  duration = 2,
}: AnimatedCounterProps) {
  const counterRef = useRef<HTMLSpanElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isInView = useInView(counterRef as any, { once: true, amount: 0.5 })
  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`)

  const numericValue = typeof value === "string" ? Number.parseInt(value.replace(/[^0-9]/g, "")) : value
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 })

  useEffect(() => {
    if (isInView) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (prefersReducedMotion) {
        setDisplayValue(`${prefix}${value}${suffix}`)
        return
      }
      motionValue.set(numericValue)
    }
  }, [isInView, numericValue, motionValue, prefix, suffix, value])

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest: number) => {
      setDisplayValue(`${prefix}${Math.round(latest).toLocaleString()}${suffix}`)
    })
    return unsubscribe
  }, [springValue, prefix, suffix])

  return (
    <span ref={counterRef} className={className}>
      {displayValue}
    </span>
  )
}

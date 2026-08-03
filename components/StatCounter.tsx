"use client"
import React, { useEffect, useRef, useState } from "react"

export default function StatCounter({ target, suffix = "", className = "" }: { target: number, suffix?: string, className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const animateCounter = () => {
      let startTime: number | null = null
      const duration = 1800
      
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        setDisplayValue(Math.floor(progress * target))
        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          setDisplayValue(target) // Ensure we reach exactly the target
        }
      }
      requestAnimationFrame(step)
    }

    const currentRef = ref.current;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          animateCounter()
        }
      })
    }, { threshold: 0.1 })
    
    if (currentRef) observer.observe(currentRef)
    return () => observer.disconnect()
  }, [hasAnimated, target])

  return (
    <span ref={ref} className={className}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  )
}

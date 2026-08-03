"use client"
import React, { useEffect, useRef, useState } from "react"

export default function RevealWrapper({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setIsVisible(true)
          if (currentRef) observer.unobserve(currentRef)
        }
      })
    }, { threshold: 0.1 })
    
    if (currentRef) {
      observer.observe(currentRef)
    }
    
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${isVisible ? "visible" : ""} ${className}`}>
      {children}
    </div>
  )
}

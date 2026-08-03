"use client"

import type React from "react"
import { type ButtonHTMLAttributes, forwardRef, useRef, useCallback, memo } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline"
}

export const RippleButton = memo(
  forwardRef<HTMLButtonElement, RippleButtonProps>(
    ({ children, className, variant = "primary", onClick, ...props }, ref) => {
      const buttonRef = useRef<HTMLButtonElement>(null)

      const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
          const button = buttonRef.current
          if (!button) return

          const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
          if (!prefersReducedMotion) {
            const rect = button.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            const ripple = document.createElement("span")
            ripple.style.cssText = `
              position: absolute;
              left: ${x}px;
              top: ${y}px;
              width: 0;
              height: 0;
              background: rgba(255, 255, 255, 0.4);
              border-radius: 50%;
              transform: translate(-50%, -50%);
              pointer-events: none;
              animation: ripple 0.6s ease-out;
            `

            button.appendChild(ripple)
            setTimeout(() => ripple.remove(), 600)
          }

          onClick?.(e)
        },
        [onClick],
      )

      const variants = {
        primary: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/30",
        secondary:
          "bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-900 dark:from-slate-800 dark:to-slate-900 dark:hover:from-slate-700 dark:hover:to-slate-800 dark:text-white shadow-md",
        outline: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 shadow-sm",
      }

      return (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300 }}
          ref={(node: HTMLButtonElement | null) => {
            ;(buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
            if (typeof ref === "function") ref(node)
            else if (ref) ref.current = node
          }}
          className={cn(
            "relative overflow-hidden px-8 py-4 rounded-2xl font-bold transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            variants[variant],
            className,
          )}
          onClick={handleClick}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...(props as any)}
        >
          {children}
        </motion.button>
      )
    },
  ),
)

RippleButton.displayName = "RippleButton"

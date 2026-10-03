"use client"

import type React from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { normalizeEmail, safeCallbackUrl } from "@/lib/auth-policy"

import { Eye, EyeOff } from "lucide-react"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const callbackUrl = safeCallbackUrl(new URLSearchParams(window.location.search).get("callbackUrl"), window.location.origin)
      const result = (await signIn("credentials", {
        redirect: false,
        callbackUrl,
        email: normalizeEmail(email),
        password,
      })) as { error?: string; ok?: boolean } | undefined

      if (result?.error) {
        setError("Invalid email or password, or sign-in is temporarily unavailable.")
      } else if (result?.ok) {
        window.location.href = callbackUrl
      } else {
        setError("Sign-in could not be confirmed. Please try again.")
      }
    } catch {
      setError("An unexpected network error occurred while logging in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel: Form */}
      <div className="w-full md:w-[55%] bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[380px] flex flex-col">
          
          <Link href="/" className="font-serif text-[1.3rem] text-[var(--text-primary)] mb-12 hover:opacity-80 transition-opacity">
            Vitamend
          </Link>

          <h1 className="font-serif text-[2.8rem] font-normal text-[var(--text-primary)] leading-[1.1] mb-2">
            Welcome Back.
          </h1>
          <p className="font-sans text-[0.9rem] text-[var(--text-muted)] mb-[40px]">
            Sign in to your account.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex flex-col gap-[28px] mb-8">
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email Address"
                className="w-full bg-transparent border-0 border-b border-[var(--border)] py-[10px] font-sans text-[0.95rem] text-[var(--text-primary)] outline-none transition-colors duration-200 focus:border-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                disabled={isLoading}
              />
              
              <div className="relative flex flex-col">
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full bg-transparent border-0 border-b border-[var(--border)] py-[10px] pr-20 font-sans text-[0.95rem] text-[var(--text-primary)] outline-none transition-colors duration-200 focus:border-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  disabled={isLoading}
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <Link 
                    href="/auth/forgot-password" 
                    className="font-sans text-[0.8rem] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-[#C1440E] text-[0.8rem] text-center mb-4 mt-[-16px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full h-[48px] justify-center mt-8"
            >
              {isLoading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="text-center mt-[24px]">
            <Link href="/auth/signup" className="font-sans text-[0.85rem] text-[var(--text-primary)]">
              <span className="text-[var(--text-muted)]">Don&apos;t have an account?</span>{" "}
              <span className="underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--text-primary)] transition-colors">Create one.</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Right Panel: Editorial Brand Panel */}
      <div className="hidden md:flex md:w-[45%] relative bg-[#2C3320] text-[#EDE9DF] p-12 flex-col justify-between">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#A89F91] uppercase">VitaMend Network</span>
        </div>
        <div className="space-y-4">
          <p className="font-serif italic text-2xl text-[#F5F2EC] leading-relaxed">
            &quot;Bridging the gap between surplus medicines and underserved communities.&quot;
          </p>
          <p className="text-xs font-mono text-[#A89F91]">
            Verified non-profit pharmaceutical redistribution
          </p>
        </div>
      </div>
    </div>
  )
}

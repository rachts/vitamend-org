"use client"

import type React from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"

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
      const result = (await signIn("credentials", {
        redirect: false,
        callbackUrl: "/dashboard",
        email,
        password,
      })) as { error?: string; ok?: boolean } | undefined

      if (result?.error) {
        setError(result.error || "Invalid email or password provided.")
      } else if (result?.ok || !result) {
        window.location.href = "/dashboard"
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

          <div className="flex items-center my-[24px]">
            <div className="flex-1 h-[1px] bg-[var(--border)]"></div>
            <span className="px-4 font-sans text-[0.8rem] text-[var(--text-muted)]">or</span>
            <div className="flex-1 h-[1px] bg-[var(--border)]"></div>
          </div>

          <button className="btn-ghost w-full justify-center flex items-center gap-[10px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

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

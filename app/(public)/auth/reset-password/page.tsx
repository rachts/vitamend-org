"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import PasswordStrength from "@/components/auth/PasswordStrength"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: "Credential Mismatch",
        description: "The confirmation passkey does not match the proposed passkey.",
        variant: "destructive",
      })
      return
    }

    if (!token) {
      toast({
        title: "Invalid Token",
        description: "Cryptographic reset token is missing or expired.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005"
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsSuccess(true)
        toast({
          title: "Key Rotated Successfully",
          description: "Your operational node credentials have been successfully updated.",
        })
        setTimeout(() => {
          router.push("/auth/signin")
        }, 3000)
      } else {
        toast({
          title: "Rotation Rejected",
          description: data.message || "Failed to execute passkey rotation.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "System Fault",
        description: "An unexpected telemetry disruption occurred during credential storage.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="card-saas p-6 space-y-5 bg-[#FFFFFF] text-center">
        <div className="p-4 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[13px] text-[#065F46] font-medium leading-relaxed">
          Cryptographic credentials rotated successfully. Redirecting your console session to node sign in...
        </div>
        <Link href="/auth/signin" className="btn-primary-saas w-full h-10">
          Authenticate with New Credential &rarr;
        </Link>
      </div>
    )
  }

  return (
    <div className="card-saas p-6 space-y-5 bg-[#FFFFFF]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-[13px] font-medium text-[#0F172A]">
            New Cryptographic Passkey
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="input-saas pr-12"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] text-[11px] font-medium"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-[13px] font-medium text-[#0F172A]">
            Confirm New Passkey
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="input-saas pr-12"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] text-[11px] font-medium"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <PasswordStrength password={password} />

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary-saas w-full h-10 text-[13px]"
          >
            {isLoading ? "Committing Credential..." : "Commit Credential Rotation"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 select-none font-body">
      <div className="w-full max-w-[400px] space-y-6">
        
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-7 h-7 rounded-md bg-[#0F766E] text-white flex items-center justify-center font-bold text-[14px] font-heading tracking-tight">
              V
            </div>
            <span className="font-heading text-[18px] text-[#0F172A] font-semibold tracking-[-0.02em]">
              Rotate Passkey
            </span>
          </Link>
          <p className="text-[13px] text-[#64748B]">
            Establish a new cryptographic passkey for your operational dispensary session.
          </p>
        </div>

        <Suspense fallback={<div className="card-saas p-8 text-center text-[#64748B] text-[13px]">Verifying Token Signature...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center">
          <p className="font-mono text-[11px] text-[#94A3B8]">
            End-to-End Encrypted via TLS 1.3 • VitaMend Auth Protocol v2
          </p>
        </div>

      </div>
    </div>
  )
}

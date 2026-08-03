"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005"
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsSuccess(true)
        toast({
          title: "Recovery Token Dispatched",
          description: data.message || "A secure cryptographic recovery token has been routed to your address.",
        })
      } else {
        toast({
          title: "Recovery Rejected",
          description: data.message || "Failed to locate registered node credential.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "System Fault",
        description: "Gateway communication timeout during credential lookup.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 select-none font-body">
      <div className="w-full max-w-[400px] space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-7 h-7 rounded-md bg-[#0F766E] text-white flex items-center justify-center font-bold text-[14px] font-heading tracking-tight">
              V
            </div>
            <span className="font-heading text-[18px] text-[#0F172A] font-semibold tracking-[-0.02em]">
              Node Recovery Protocol
            </span>
          </Link>
          <p className="text-[13px] text-[#64748B]">
            Enter your registered institutional email to initiate secure passkey reset.
          </p>
        </div>

        {/* Card */}
        <div className="card-saas p-6 space-y-5 bg-[#FFFFFF]">
          {isSuccess ? (
            <div className="space-y-5 text-center">
              <div className="p-4 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[13px] text-[#065F46] font-medium leading-relaxed text-left">
                If a matching node identity is registered under <strong>{email}</strong>, an automated recovery packet has been dispatched. Please check your secure inbox.
              </div>
              <Link href="/auth/signin" className="btn-secondary-saas w-full h-10">
                Return to Node Authentication
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[13px] font-medium text-[#0F172A]">
                  Institutional Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="dispensary@lilawati-hospital.org"
                  className="input-saas"
                  disabled={isLoading}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary-saas w-full h-10 text-[13px]"
                >
                  {isLoading ? "Dispatching Token..." : "Transmit Recovery Token"}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link 
                  href="/auth/signin" 
                  className="text-[12px] font-medium text-[#475569] hover:text-[#0F172A] hover:underline"
                >
                  &larr; Abort recovery and return to sign in
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="text-center">
          <p className="font-mono text-[11px] text-[#94A3B8]">
            Recovery tokens expire precisely 15 minutes after issuance via SHA-256 HMAC.
          </p>
        </div>

      </div>
    </div>
  )
}

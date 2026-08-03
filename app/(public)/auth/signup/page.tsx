"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { signIn } from "next-auth/react"
import Link from "next/link"
import PasswordStrength from "@/components/auth/PasswordStrength"

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "donor",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The confirm password does not match the password entered.",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      })
      
      const data = await res.json()
      
      if (!data.success) {
        throw new Error(data.message || "Account registration failed")
      }

      toast({
        title: "Account Registered",
        description: "Your partner account has been verified. Initializing secure session...",
      })
      
      await signIn("credentials", {
        redirect: true,
        callbackUrl: "/dashboard",
        email: formData.email,
        password: formData.password,
      })
    } catch (error: unknown) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register account. Please check your details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 my-10 select-none font-body">
      <div className="w-full max-w-[460px] space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-7 h-7 rounded-md bg-[#0F766E] text-white flex items-center justify-center font-bold text-[14px] font-heading tracking-tight">
              V
            </div>
            <span className="font-heading text-[18px] text-[#0F172A] font-semibold tracking-[-0.02em]">
              Partner Onboarding Portal
            </span>
          </Link>
          <p className="text-[13px] text-[#64748B]">
            Register an accredited clinic, pharmacy, or donor partner account.
          </p>
        </div>

        {/* Registration Card */}
        <div className="card-saas p-6 space-y-5 bg-[#FFFFFF]">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-[13px] font-medium text-[#0F172A]">
                Organization or Clinic Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Apollo Memorial Community Health Clinic"
                className="input-saas"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[13px] font-medium text-[#0F172A]">
                Work Email or Organization Contact
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="contact@community-clinic.org"
                className="input-saas"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="role" className="block text-[13px] font-medium text-[#0F172A]">
                Primary Platform Role
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-saas font-medium text-[#0F172A] cursor-pointer"
                disabled={isLoading}
              >
                <option value="donor">I want to donate medicines</option>
                <option value="volunteer">I want to volunteer</option>
                <option value="ngo">I represent an NGO</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-[13px] font-medium text-[#0F172A]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="input-saas pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] text-[11px] font-medium"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-[13px] font-medium text-[#0F172A]">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="input-saas pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] text-[11px] font-medium"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <PasswordStrength password={formData.password} />

            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary-saas w-full h-10 text-[13px]"
              >
                {isLoading ? "Creating Partner Account..." : "Register Partner Account"}
              </button>
            </div>
          </form>
          
          <div className="border-t border-[#F1F5F9] pt-4 text-center">
            <span className="text-[13px] text-[#64748B]">Already registered? </span>
            <Link 
              href="/auth/signin" 
              className="text-[13px] font-medium text-[#0F766E] hover:text-[#0D9488] hover:underline"
            >
              Log In to Existing Account &rarr;
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <div className="text-center space-y-1">
          <p className="font-mono text-[11px] text-[#94A3B8]">
            HIPAA Healthcare Data Protection • SSL Certified Transmission
          </p>
          <p className="text-[11px] text-[#64748B]">
            By registering, your institution commits to safe storage and non-profit redistribution protocols.
          </p>
        </div>

      </div>
    </div>
  )
}

import type { Metadata } from "next"
import React, { Suspense } from "react"
import DonationForm from "./donation-form"
import { auth } from "@/auth";
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Donate Surplus Medicines | Vitamend",
}

function OcrLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-[24px] h-[24px] rounded-full border-[1px] border-[var(--border)] border-t-[var(--accent-dark)] animate-spin"></div>
    </div>
  )
}

export default async function DonatePage() {
  const session = await auth()
  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <main className="w-full">
      <Suspense fallback={<OcrLoadingFallback />}>
        <DonationForm />
      </Suspense>
    </main>
  )
}

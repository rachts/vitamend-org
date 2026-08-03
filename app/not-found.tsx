import Link from "next/link"
import React from "react"
import NavBar from "@/components/ui/NavBar"
import Footer from "@/components/footer"

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <NavBar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif text-[clamp(4rem,8vw,6rem)] text-[var(--text-primary)] leading-none mb-4">
          404
        </h1>
        <h2 className="font-serif text-[var(--text-h2)] text-[var(--text-primary)] mb-4">
          Page Not Found
        </h2>
        <p className="font-sans text-[var(--text-body)] text-[var(--text-secondary)] mb-8 max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="btn-primary"
        >
          Return Home
        </Link>
      </main>

      <Footer />
    </div>
  )
}

import React from "react";
import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased">
      <NavBar />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 pt-28 pb-12 overflow-x-hidden">
        {children}
      </main>
      <Footer />
    </div>
  );
}

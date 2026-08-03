import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import Providers from "./providers";
import ClientWrappers from "./_client-wrappers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL?.startsWith("http")
      ? process.env.NEXTAUTH_URL
      : `https://${process.env.NEXTAUTH_URL || "vitamend.in"}`
  ),
  title: { default: "VitaMend — Medicine Redistribution Platform", template: "%s | VitaMend" },
  description: "VitaMend scans medicine labels, verifies expiry dates, and routes surplus stock to clinics reporting shortages.",
  keywords: ["medicine redistribution", "surplus medicine", "healthcare platform", "OCR medicine scanning", "NGO medicine donation", "CDSCO compliant"],
  openGraph: {
    title: "VitaMend — Medicine Redistribution Platform",
    description: "Scan medicine labels, verify expiry dates, route surplus stock to clinics in need.",
    type: "website",
    locale: "en_IN",
    url: "https://vitamend.in",
    siteName: "VitaMend",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "VitaMend", type: "image/png" }],
  },
  twitter: { card: "summary_large_image", title: "VitaMend", description: "Medicine redistribution built for NGOs, hospitals, and pharmacies.", images: ["/og-image.png"] },
  icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
  manifest: "/manifest.json",
  category: "Healthcare",
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#0F766E" }],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  "name": "VitaMend Healthcare Foundation",
  "alternateName": "VitaMend",
  "url": "https://vitamend.in",
  "logo": "https://vitamend.in/icon.svg",
  "description": "AI-powered pharmaceutical redistribution platform bridging surplus medicine with community health clinics.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Okhla Industrial Estate Phase III",
    "addressLocality": "New Delhi",
    "addressRegion": "Delhi",
    "postalCode": "110020",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-11-4050-9980",
    "contactType": "customer service",
    "email": "vitamend.org@gmail.com",
    "availableLanguage": ["English", "Hindi"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased font-body">
        <Providers>
          <ClientWrappers>
            {children}
            <Toaster />
          </ClientWrappers>
        </Providers>
      </body>
    </html>
  );
}

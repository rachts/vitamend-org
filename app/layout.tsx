import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import Providers from "./providers";
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
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://vitamend.in"),
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
  },
  twitter: {
    card: "summary_large_image",
    title: "VitaMend",
    description: "Medicine redistribution built for NGOs, hospitals, and pharmacies.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
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
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "contact@vitamend.in",
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
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

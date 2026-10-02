import type React from "react";
import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Providers from "./providers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const fontBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fontDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://vitamend.in"),
  title: {
    default: "VitaMend | Donate Unused Medicines, Help Someone in Need",
    template: "%s | VitaMend",
  },
  description:
    "Donate unused, unexpired medicines to verified clinics and NGOs. AI-assisted label scanning helps ensure safe redistribution to patients in need.",
  keywords: [
    "medicine donation",
    "medicine redistribution",
    "surplus medicine",
    "healthcare platform",
    "OCR medicine scanning",
    "NGO medicine donation",
  ],
  openGraph: {
    title: "VitaMend | Donate Unused Medicines, Help Someone in Need",
    description:
      "Donate unused, unexpired medicines to verified clinics and NGOs. AI-assisted label scanning helps ensure safe redistribution to patients in need.",
    type: "website",
    locale: "en_IN",
    url: "https://vitamend.in",
    siteName: "VitaMend",
  },
  twitter: {
    card: "summary_large_image",
    title: "VitaMend | Donate Unused Medicines, Help Someone in Need",
    description:
      "Donate unused, unexpired medicines to verified clinics and NGOs. AI-assisted label scanning helps ensure safe redistribution to patients in need.",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
  },
  manifest: "/manifest.json",
  category: "Healthcare",
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#2C3320" }],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  "name": "VitaMend Healthcare Platform",
  "alternateName": "VitaMend",
  "url": "https://vitamend.in",
  "logo": "https://vitamend.in/icon.svg",
  "description":
    "Pharmaceutical redistribution platform connecting unused surplus medicines with community health clinics and verified NGOs.",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "support",
    "email": "contact@vitamend.in",
    "availableLanguage": ["English", "Hindi"],
  },
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
      <body className="antialiased font-body min-h-screen overflow-x-hidden bg-[#F5F2EC] text-[#1C1A14]">
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

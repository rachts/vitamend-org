import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supply Chain Platform",
  description: "Live supply chain activity and logistics routing across partner clinics.",
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

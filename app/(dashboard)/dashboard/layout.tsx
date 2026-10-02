import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
  description: "VitaMend donor dashboard, active donations, and verification status.",
};

export default function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

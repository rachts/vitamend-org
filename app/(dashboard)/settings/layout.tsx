import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Configure notification preferences and security settings.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

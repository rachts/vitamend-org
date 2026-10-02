import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Health Clinics",
  description: "Certified community health clinics and non-profit healthcare providers receiving redistributed surplus medicines.",
};

export default function ClinicsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

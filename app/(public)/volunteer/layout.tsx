import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Volunteer",
  description: "Join the VitaMend healthcare network as a pharmacist or logistics volunteer.",
};

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

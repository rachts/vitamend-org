import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Profile",
  description: "Manage your VitaMend account details and credentials.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

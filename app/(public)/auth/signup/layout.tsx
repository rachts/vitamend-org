import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Register for a VitaMend account as a medicine donor, healthcare volunteer, or clinic representative.",
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "System notifications, donation intake alerts, and verification updates.",
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

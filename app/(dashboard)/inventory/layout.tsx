import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory Management",
  description: "Track verified surplus medicines in the VitaMend redistribution network.",
};

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

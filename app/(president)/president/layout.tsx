import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "President Dashboard" },
};

export default function PresidentNestedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

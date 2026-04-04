import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "VP Product Dashboard" },
};

export default function VpProductNestedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "VP Marketing Dashboard" },
};

export default function VpMarketingNestedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

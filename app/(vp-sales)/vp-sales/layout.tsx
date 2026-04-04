import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "VP Sales Dashboard" },
};

export default function VpSalesNestedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

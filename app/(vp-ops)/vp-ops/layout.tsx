import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "VP Operations Dashboard" },
};

export default function VpOpsNestedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

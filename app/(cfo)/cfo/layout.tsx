import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "CFO Dashboard" },
};

export default function CfoNestedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

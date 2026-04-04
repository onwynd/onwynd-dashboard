import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "COO Dashboard" },
};

export default function COONestedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

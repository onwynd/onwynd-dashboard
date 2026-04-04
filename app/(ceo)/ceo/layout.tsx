import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "CEO Dashboard" },
};

export default function CEONestedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

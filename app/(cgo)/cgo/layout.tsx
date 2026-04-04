import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "CGO Dashboard" },
};

export default function CGONestedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

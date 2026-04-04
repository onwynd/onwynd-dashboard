import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Audit Dashboard" },
};

export default function AuditNestedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

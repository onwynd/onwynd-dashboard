import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Finance Dashboard" },
};

export default function FinanceNestedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

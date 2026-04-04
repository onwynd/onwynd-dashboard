import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Manager Dashboard" },
};

export default function ManagerNestedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

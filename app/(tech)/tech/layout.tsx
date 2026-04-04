import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Tech Dashboard" },
};

export default function TechNestedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

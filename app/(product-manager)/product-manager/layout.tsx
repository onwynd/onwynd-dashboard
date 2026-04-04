import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Product Dashboard" },
};

export default function ProductManagerNestedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

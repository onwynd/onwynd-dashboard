import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Employee Dashboard" },
};

export default function EmployeeNestedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

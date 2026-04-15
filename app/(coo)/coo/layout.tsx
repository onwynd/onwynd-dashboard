import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "COO Dashboard" },
};

export default function COONestedLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["coo", "admin", "super_admin"]}>{children}</RoleGuard>;
}

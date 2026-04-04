import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Institution Dashboard" };

export default function InstitutionDashboardAliasPage() {
  redirect("/institutional/dashboard");
}

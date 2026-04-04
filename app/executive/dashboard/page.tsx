import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Executive Dashboard" };

export default function ExecutiveDashboardAliasPage() {
  redirect("/ceo/dashboard");
}

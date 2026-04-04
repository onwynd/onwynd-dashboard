import type { Metadata } from "next";
import { DashboardContent } from "@/components/legal-dashboard/content";

export const metadata: Metadata = { title: "Legal Dashboard" };

export default function LegalDashboardPage() {
  return <DashboardContent />;
}

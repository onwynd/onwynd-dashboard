import type { Metadata } from "next";
import { DashboardContent } from "@/components/clinical-dashboard/content";

export const metadata: Metadata = { title: "Clinical Dashboard" };

export default function ClinicalDashboardPage() {
  return <DashboardContent />;
}

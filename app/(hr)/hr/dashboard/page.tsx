import type { Metadata } from "next";
import { DashboardContent } from "@/components/hr-dashboard/content";

export const metadata: Metadata = { title: "HR Dashboard" };

export default function HRDashboard() {
  return <DashboardContent />;
}

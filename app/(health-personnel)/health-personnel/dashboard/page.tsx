import type { Metadata } from "next";
import { DashboardContent } from "@/components/health-dashboard/dashboard-content";

export const metadata: Metadata = { title: "Health Personnel Dashboard" };

export default function HealthPersonnelDashboardPage() {
  return <DashboardContent />;
}

import type { Metadata } from "next";
import { DashboardContent } from "@/components/institutional-dashboard/dashboard-content";

export const metadata: Metadata = { title: "Institutional Dashboard" };

export default function DashboardPage() {
  return <DashboardContent />;
}

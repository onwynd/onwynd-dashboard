import type { Metadata } from "next";
import { DashboardContent } from "@/components/rm-dashboard/content";

export const metadata: Metadata = { title: "RM Dashboard" };

export default function RMDashboardPage() {
  return <DashboardContent />;
}
import type { Metadata } from "next";
import { DashboardContent } from "@/components/support-dashboard/content";

export const metadata: Metadata = { title: "Support Dashboard" };

export default function SupportDashboardPage() {
  return <DashboardContent />;
}

import type { Metadata } from "next";
import { DashboardContent } from "@/components/partner-dashboard/content";

export const metadata: Metadata = { title: "Partner Dashboard" };

export default function PartnerDashboardPage() {
  return <DashboardContent />;
}

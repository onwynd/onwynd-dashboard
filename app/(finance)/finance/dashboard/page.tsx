import type { Metadata } from "next";
import { DashboardContent } from "@/components/finance-dashboard/content";

export const metadata: Metadata = { title: "Finance Dashboard" };

export default function DashboardPage() {
  return <DashboardContent />;
}

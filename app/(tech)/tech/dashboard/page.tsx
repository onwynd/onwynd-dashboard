import type { Metadata } from "next";
import { DashboardContent } from "@/components/tech-dashboard/content";

export const metadata: Metadata = { title: "Tech Dashboard" };

export default function DashboardPage() {
  return <DashboardContent />;
}

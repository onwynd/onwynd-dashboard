import type { Metadata } from "next";
import { NgoDashboardContent } from "@/components/ngo-dashboard/dashboard-content";

export const metadata: Metadata = { title: "NGO Dashboard" };

export default function NgoDashboardPage() {
  return <NgoDashboardContent />;
}

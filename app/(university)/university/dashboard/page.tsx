import type { Metadata } from "next";
import { UniversityDashboardContent } from "@/components/university-dashboard/dashboard-content";

export const metadata: Metadata = { title: "University Dashboard" };

export default function UniversityDashboardPage() {
  return <UniversityDashboardContent />;
}

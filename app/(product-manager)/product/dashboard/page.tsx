import type { Metadata } from "next";
import { DashboardContent } from "@/components/product-dashboard/content";

export const metadata: Metadata = { title: "Product Dashboard" };

export default function DashboardPage() {
  return <DashboardContent />;
}

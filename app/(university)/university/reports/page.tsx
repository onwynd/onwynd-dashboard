import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports" };

// Re-uses the institutional reports implementation — API data is the same
export { default } from "@/app/(institutional)/institutional/reports/page";

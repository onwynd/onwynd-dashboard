import type { Metadata } from "next";

export const metadata: Metadata = { title: "Billing" };

// Re-uses the institutional billing implementation
export { default } from "@/app/(institutional)/institutional/billing/page";

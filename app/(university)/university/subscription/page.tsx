import type { Metadata } from "next";

export const metadata: Metadata = { title: "Subscription" };

// Re-uses the institutional subscription implementation
export { default } from "@/app/(institutional)/institutional/subscription/page";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documents" };

// Re-uses the institutional documents implementation
export { default } from "@/app/(institutional)/institutional/documents/page";

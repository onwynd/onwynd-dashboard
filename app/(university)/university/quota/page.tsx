import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quota" };

// Re-uses the institutional quota implementation
export { default } from "@/app/(institution)/institution/quota/page";

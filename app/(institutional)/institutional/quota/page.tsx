// DB6: Quota page consolidated into (institutional) route group.
// Re-exports the implementation from the shared location.
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quota Management" };

export { default } from "@/app/(institution)/institution/quota/page";

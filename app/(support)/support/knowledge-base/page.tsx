import type { Metadata } from "next";
import { KnowledgeBaseView } from "@/components/support-dashboard/knowledge-base-view";

export const metadata: Metadata = { title: "Knowledge Base" };

export default function SupportKnowledgeBasePage() {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 bg-background w-full space-y-6">
      <KnowledgeBaseView />
    </div>
  );
}

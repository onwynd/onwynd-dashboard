"use client";

import { usePageView } from "@/hooks/usePageView";
import { ApprovalInbox } from "@/components/shared/ApprovalInbox";

export default function HRApprovalsPage() {
  usePageView("hr.approvals");

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Review requests in your inbox and track your submitted requests.
        </p>
      </div>
      <ApprovalInbox showTabs />
    </div>
  );
}

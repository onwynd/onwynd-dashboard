"use client";

import { usePageView } from "@/hooks/usePageView";
import { ApprovalInbox } from "@/components/shared/ApprovalInbox";

export default function COOApprovalsPage() {
  usePageView("coo.approvals");

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Approval Inbox</h1>
        <p className="text-sm text-muted-foreground">
          All pending approvals routed to you across leave, budget, promotions, and transfers.
        </p>
      </div>
      <ApprovalInbox showTabs />
    </div>
  );
}

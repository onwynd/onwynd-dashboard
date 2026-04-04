"use client";

import { usePageView } from "@/hooks/usePageView";
import { ApprovalInbox } from "@/components/shared/ApprovalInbox";

export default function CFOApprovalsPage() {
  usePageView("cfo.approvals");

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Approval Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Financial approval requests — budgets, expenses, and reimbursements assigned to you.
        </p>
      </div>
      <ApprovalInbox showTabs />
    </div>
  );
}

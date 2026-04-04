"use client";

import { usePageView } from "@/hooks/usePageView";
import { ApprovalInbox } from "@/components/shared/ApprovalInbox";

export default function FinanceApprovalsPage() {
  usePageView("finance.approvals");

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Budget, expense, and financial approval requests assigned to you.
        </p>
      </div>
      <ApprovalInbox showTabs />
    </div>
  );
}

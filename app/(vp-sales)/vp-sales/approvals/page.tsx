"use client";

import { usePageView } from "@/hooks/usePageView";
import { ApprovalInbox } from "@/components/shared/ApprovalInbox";

export default function VPSalesApprovalsPage() {
  usePageView("vp_sales.approvals");

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Sales budget, team, and pipeline approval requests.
        </p>
      </div>
      <ApprovalInbox showTabs />
    </div>
  );
}

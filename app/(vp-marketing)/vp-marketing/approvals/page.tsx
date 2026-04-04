"use client";

import { usePageView } from "@/hooks/usePageView";
import { ApprovalInbox } from "@/components/shared/ApprovalInbox";

export default function VPMarketingApprovalsPage() {
  usePageView("vp_marketing.approvals");

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Marketing budget, campaign expense, and team approval requests.
        </p>
      </div>
      <ApprovalInbox showTabs />
    </div>
  );
}

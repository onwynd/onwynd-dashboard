"use client";

import { usePageView } from "@/hooks/usePageView";
import { ApprovalInbox } from "@/components/shared/ApprovalInbox";

export default function MarketingApprovalsPage() {
  usePageView("marketing.approvals");

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Track budget requests, campaign expenses, and other approvals you have submitted.
        </p>
      </div>
      <ApprovalInbox showTabs />
    </div>
  );
}

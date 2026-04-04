"use client";

import { BudgetApprovalQueue } from "@/components/shared/BudgetApprovalQueue";

export default function CfoBudgetApprovalsPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Final Budget Approval</h1>
        <p className="text-sm text-muted-foreground">
          CEO-approved budgets awaiting Finance sign-off. Approving here deducts the amount from the allocated budget pool.
        </p>
      </div>
      <BudgetApprovalQueue role="cfo" />
    </div>
  );
}

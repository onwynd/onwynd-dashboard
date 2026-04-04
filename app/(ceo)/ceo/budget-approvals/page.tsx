"use client";

import { BudgetApprovalQueue } from "@/components/shared/BudgetApprovalQueue";

export default function CeoBudgetApprovalsPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Budget Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Review COO-approved budget requests. Approved budgets proceed to Finance for final deduction.
        </p>
      </div>
      <BudgetApprovalQueue role="ceo" />
    </div>
  );
}

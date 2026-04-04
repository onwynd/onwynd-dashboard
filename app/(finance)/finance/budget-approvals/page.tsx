"use client";

import { BudgetApprovalQueue } from "@/components/shared/BudgetApprovalQueue";

export default function FinanceBudgetApprovalsPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Budget Approvals — Finance</h1>
        <p className="text-sm text-muted-foreground">
          Final approval stage. Budgets here have been approved by both COO and CEO.
          Approving releases the budget and records it as an authorised expense.
        </p>
      </div>
      <BudgetApprovalQueue role="finance" />
    </div>
  );
}

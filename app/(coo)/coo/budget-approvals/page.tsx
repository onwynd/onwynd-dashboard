"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { BudgetApprovalQueue } from "@/components/shared/BudgetApprovalQueue";
import { useBudgetStore } from "@/store/budget-store";

const CATEGORIES = [
  "Digital Ads", "Events", "Team Travel", "Accommodation", "Tools & Software",
  "Training", "Operations", "PR", "Other",
];
const PERIODS = ["Q1-2026", "Q2-2026", "Q3-2026", "Q4-2026", "2026-04", "2026-05", "2026-06"];
const DEPARTMENTS = ["marketing", "sales", "operations", "hr", "finance", "product", "other"];

export default function CooBudgetApprovalsPage() {
  const { createBudget, submitBudget } = useBudgetStore();
  const [showForm, setShowForm]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [form, setForm] = useState({
    department: DEPARTMENTS[0],
    category:   CATEGORIES[0],
    title:      "",
    description: "",
    amount_requested: "",
    period:     PERIODS[0],
  });

  const handleCreate = async (andSubmit = false) => {
    if (!form.title || !form.amount_requested) return;
    setSubmitting(true);
    try {
      const budget = await createBudget({
        department:       form.department,
        category:         form.category,
        title:            form.title,
        description:      form.description,
        amount_requested: parseFloat(form.amount_requested),
        currency:         "NGN",
        period:           form.period,
      });
      if (andSubmit) {
        // COO submitting their own budget goes straight to CEO queue
        await submitBudget(budget.id);
      }
      setShowForm(false);
      setForm({ department: DEPARTMENTS[0], category: CATEGORIES[0], title: "", description: "", amount_requested: "", period: PERIODS[0] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Budget Approvals</h1>
          <p className="text-sm text-muted-foreground">
            Review and approve budget requests from department leads. You can also submit budget
            requests on behalf of a department — they will skip COO review and go directly to CEO.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
        >
          <PlusCircle size={16} /> New Budget
        </button>
      </div>

      {/* COO creates a budget */}
      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-base">Create Budget Request</h2>
          <p className="text-xs text-muted-foreground">
            As COO, submitting this budget will send it directly to the CEO for approval.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              >
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Q2 Marketing Campaigns"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Amount (NGN) <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={0}
                value={form.amount_requested}
                onChange={(e) => setForm({ ...form, amount_requested: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="1000000"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Period</label>
              <select
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              >
                {PERIODS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Justification</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Explain the purpose and expected outcome of this budget…"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={submitting || !form.title || !form.amount_requested}
              onClick={() => handleCreate(false)}
              className="flex-1 px-4 py-2 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/10 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Saving…" : "Save as Draft"}
            </button>
            <button
              disabled={submitting || !form.title || !form.amount_requested}
              onClick={() => handleCreate(true)}
              className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Submitting…" : "Submit to CEO"}
            </button>
          </div>
        </div>
      )}

      {/* Approval queue */}
      <div>
        <h2 className="text-base font-semibold mb-3">Pending Your Approval</h2>
        <BudgetApprovalQueue role="coo" />
      </div>
    </div>
  );
}

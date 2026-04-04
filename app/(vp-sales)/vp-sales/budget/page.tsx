"use client";

// Re-uses the same budget page as marketing but pre-sets department to 'sales'
import { useEffect, useState } from "react";
import { PlusCircle, Send, Trash2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useBudgetStore, type BudgetStatus } from "@/store/budget-store";
import { PermissionGate } from "@/components/shared/PermissionGate";

const STATUS_ICON: Record<BudgetStatus, React.ReactNode> = {
  draft:           <Clock size={14} className="text-gray-400" />,
  pending_coo:     <Clock size={14} className="text-amber-500" />,
  pending_ceo:     <Clock size={14} className="text-amber-500" />,
  pending_finance: <Clock size={14} className="text-blue-500" />,
  approved:        <CheckCircle2 size={14} className="text-green-500" />,
  rejected:        <XCircle size={14} className="text-red-500" />,
  queried:         <></>,
};

const STATUS_LABEL: Record<BudgetStatus, string> = {
  draft:           "Draft",
  pending_coo:     "Awaiting COO",
  pending_ceo:     "Awaiting CEO",
  pending_finance: "Awaiting Finance",
  approved:        "Approved",
  rejected:        "Rejected",
  queried:         "",
};

const CATEGORIES = ["Team Travel", "Events & Conferences", "Tools & Software", "Sales Collateral", "Training", "Other"];
const PERIODS    = ["Q1-2026", "Q2-2026", "Q3-2026", "Q4-2026", "2026-04", "2026-05", "2026-06"];

export default function SalesBudgetPage() {
  const { budgets, isLoading, fetchBudgets, createBudget, submitBudget, deleteBudget } = useBudgetStore();
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", category: CATEGORIES[0], description: "", amount_requested: "", period: PERIODS[0] });

  useEffect(() => { fetchBudgets(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!form.title || !form.amount_requested) return;
    setSubmitting(true);
    try {
      await createBudget({
        department: "sales",
        category: form.category,
        title: form.title,
        description: form.description,
        amount_requested: parseFloat(form.amount_requested),
        currency: "NGN",
        period: form.period,
      });
      setShowForm(false);
      setForm({ title: "", category: CATEGORIES[0], description: "", amount_requested: "", period: PERIODS[0] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Budget</h1>
          <p className="text-sm text-muted-foreground">Submit and track sales budget requests. Approvals go COO → CEO → Finance.</p>
        </div>
        <PermissionGate resource="budget" permission="write">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <PlusCircle size={16} /> New Request
          </button>
        </PermissionGate>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-base">New Budget Request</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Title <span className="text-red-500">*</span></label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Q2 Sales Conference" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Amount (NGN) <span className="text-red-500">*</span></label>
              <input type="number" value={form.amount_requested} onChange={(e) => setForm({ ...form, amount_requested: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                min="0" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Period</label>
              <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                {PERIODS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Justification</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Why is this budget needed?" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
            <button disabled={submitting || !form.title || !form.amount_requested} onClick={handleCreate}
              className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
              {submitting ? "Saving…" : "Save as Draft"}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : budgets.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No budget requests yet.</div>
      ) : (
        <div className="divide-y divide-border rounded-2xl border overflow-hidden">
          {budgets.map((budget) => (
            <div key={budget.id} className="p-4 bg-card hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {STATUS_ICON[budget.status]}
                    <span className="font-semibold text-sm">{budget.title}</span>
                    <span className="text-xs text-muted-foreground">{STATUS_LABEL[budget.status]}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-x-3">
                    <span>{budget.category}</span>
                    <span>{budget.period}</span>
                    <span className="font-semibold text-foreground">₦{Number(budget.amount_requested).toLocaleString()}</span>
                  </div>
                  {budget.rejection_reason && <p className="text-xs text-red-500 mt-1">Rejected: {budget.rejection_reason}</p>}
                </div>
                {budget.status === "draft" && (
                  <div className="flex gap-2 shrink-0">
                    <PermissionGate resource="budget" permission="write">
                      <button onClick={() => submitBudget(budget.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
                        <Send size={12} /> Submit
                      </button>
                    </PermissionGate>
                    <PermissionGate resource="budget" permission="delete">
                      <button onClick={() => { if (confirm("Delete this draft?")) deleteBudget(budget.id); }}
                        className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </PermissionGate>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

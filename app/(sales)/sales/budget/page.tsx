"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Send, Trash2, CheckCircle2, Clock, XCircle, AlertCircle, MessageSquare, Lock } from "lucide-react";
import { useBudgetStore, type BudgetRequest, type BudgetStatus } from "@/store/budget-store";
import { PermissionGate } from "@/components/shared/PermissionGate";
import client from "@/lib/api/client";

// ── Types & constants ─────────────────────────────────────────────────────────

const STATUS_ICON: Record<BudgetStatus, React.ReactNode> = {
  draft:           <Clock size={14} className="text-gray-400" />,
  pending_coo:     <Clock size={14} className="text-amber-500" />,
  pending_ceo:     <Clock size={14} className="text-amber-500" />,
  queried:         <AlertCircle size={14} className="text-purple-500" />,
  pending_finance: <Clock size={14} className="text-blue-500" />,
  approved:        <CheckCircle2 size={14} className="text-green-500" />,
  rejected:        <XCircle size={14} className="text-red-500" />,
};

const STATUS_LABEL: Record<BudgetStatus, string> = {
  draft:           "Draft",
  pending_coo:     "Awaiting COO",
  pending_ceo:     "Awaiting CEO",
  queried:         "Queried — Response Needed",
  pending_finance: "Awaiting Finance",
  approved:        "Approved",
  rejected:        "Rejected",
};

const CATEGORIES = [
  "Team Travel", "Accommodation", "Transport",
  "Events & Conferences", "Tools & Software",
  "Sales Collateral", "Training", "Entertainment", "Other",
];
const PERIODS = ["Q1-2026", "Q2-2026", "Q3-2026", "Q4-2026", "2026-04", "2026-05", "2026-06"];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SalesBudgetPage() {
  const { budgets, isLoading, fetchBudgets, createBudget, submitBudget, deleteBudget, respondToQuery } =
    useBudgetStore();

  // Intelligent switch — read from settings.budgets.sales_can_create
  // Defaults to true (creation enabled) until the flag is explicitly disabled by admin
  const [salesCanCreate, setSalesCanCreate] = useState<boolean>(true);
  const [switchLoading, setSwitchLoading]   = useState(true);

  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", category: CATEGORIES[0], description: "", amount_requested: "", period: PERIODS[0],
  });

  // Respond-to-query modal
  const [respondBudget, setRespondBudget]   = useState<BudgetRequest | null>(null);
  const [responseText, setResponseText]     = useState("");
  const [responding, setResponding]         = useState(false);

  useEffect(() => {
    fetchBudgets();
    // Load the intelligent switch setting
    client.get("/api/v1/settings/budgets")
      .then((res) => {
        const data = res.data?.data ?? res.data ?? {};
        // Key: budgets.sales_can_create — defaults true if not set
        const flag = data?.sales_can_create;
        setSalesCanCreate(flag === undefined ? true : Boolean(flag));
      })
      .catch(() => setSalesCanCreate(true)) // fail open — show form if setting unreachable
      .finally(() => setSwitchLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!form.title || !form.amount_requested) return;
    setSubmitting(true);
    try {
      await createBudget({
        department:       "sales",
        category:         form.category,
        title:            form.title,
        description:      form.description,
        amount_requested: parseFloat(form.amount_requested),
        currency:         "NGN",
        period:           form.period,
      });
      setShowForm(false);
      setForm({ title: "", category: CATEGORIES[0], description: "", amount_requested: "", period: PERIODS[0] });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async () => {
    if (!respondBudget || !responseText.trim()) return;
    setResponding(true);
    try {
      await respondToQuery(respondBudget.id, responseText);
      setRespondBudget(null);
      setResponseText("");
    } finally {
      setResponding(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Budget</h1>
          <p className="text-sm text-muted-foreground">
            Submit and track sales budget requests — travel, accommodation, events, etc.
            Approvals: COO → CEO → Finance.
          </p>
        </div>

        {/* Intelligent switch: hide button if sales_can_create is false */}
        {!switchLoading && salesCanCreate && (
          <PermissionGate resource="budget" permission="write">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <PlusCircle size={16} /> New Request
            </button>
          </PermissionGate>
        )}

        {/* Switch is OFF — show a disabled notice */}
        {!switchLoading && !salesCanCreate && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted border border-border text-sm text-muted-foreground">
            <Lock size={14} />
            Budget creation managed by department heads
          </div>
        )}
      </div>

      {/* New budget form */}
      {showForm && salesCanCreate && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-base">New Budget Request</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Q2 Sales Conference — Lagos"
              />
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
              <label className="block text-xs font-semibold mb-1">Amount (NGN) <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={0}
                value={form.amount_requested}
                onChange={(e) => setForm({ ...form, amount_requested: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="350000"
              />
            </div>

            <div>
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
            <label className="block text-xs font-semibold mb-1">Justification / Details</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Explain the purpose, expected ROI, or business need for this spend…"
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
              onClick={handleCreate}
              className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Saving…" : "Save as Draft"}
            </button>
          </div>
        </div>
      )}

      {/* Budget list */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          {salesCanCreate
            ? "No budget requests yet. Click \"New Request\" to start."
            : "No budget requests found."}
        </div>
      ) : (
        <div className="divide-y divide-border rounded-2xl border overflow-hidden">
          {budgets.map((budget) => (
            <div key={budget.id} className="p-4 bg-card hover:bg-muted/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {STATUS_ICON[budget.status]}
                    <span className="font-semibold text-sm">{budget.title}</span>
                    <span className="text-xs text-muted-foreground">{STATUS_LABEL[budget.status]}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-x-3">
                    <span>{budget.category}</span>
                    <span>{budget.period}</span>
                    <span className="font-semibold text-foreground">
                      ₦{Number(budget.amount_requested).toLocaleString()}
                    </span>
                  </div>
                  {budget.rejection_reason && (
                    <p className="text-xs text-red-500 mt-1">Rejected: {budget.rejection_reason}</p>
                  )}
                  {/* CEO query banner */}
                  {budget.status === "queried" && budget.ceo_query_notes && (
                    <div className="mt-2 p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-800">
                      <span className="font-semibold">CEO query:</span> {budget.ceo_query_notes}
                      {budget.ceo_suggested_amount && (
                        <span className="ml-2 font-semibold">
                          · Suggested: ₦{Number(budget.ceo_suggested_amount).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  {budget.status === "draft" && (
                    <>
                      <PermissionGate resource="budget" permission="write">
                        <button
                          onClick={() => submitBudget(budget.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          <Send size={12} /> Submit
                        </button>
                      </PermissionGate>
                      <PermissionGate resource="budget" permission="delete">
                        <button
                          onClick={() => { if (confirm("Delete this draft?")) deleteBudget(budget.id); }}
                          className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </PermissionGate>
                    </>
                  )}

                  {/* Respond to CEO query */}
                  {budget.status === "queried" && (
                    <button
                      onClick={() => { setRespondBudget(budget); setResponseText(""); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
                    >
                      <MessageSquare size={12} /> Respond
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Respond-to-query modal */}
      {respondBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="font-bold text-lg">Respond to CEO Query</h2>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 space-y-1">
              <p className="font-semibold">{respondBudget.title}</p>
              <p>{respondBudget.ceo_query_notes}</p>
              {respondBudget.ceo_suggested_amount && (
                <p className="font-semibold">
                  CEO suggested: ₦{Number(respondBudget.ceo_suggested_amount).toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Your response <span className="text-red-500">*</span>
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Explain why this amount is necessary or address the CEO's concern…"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRespondBudget(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={responding || !responseText.trim()}
                onClick={handleRespond}
                className="flex-1 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {responding ? "Submitting…" : "Submit Response"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

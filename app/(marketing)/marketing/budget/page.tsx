"use client";

import { useEffect, useRef, useState } from "react";
import {
  PlusCircle, CheckCircle2, Clock, XCircle, Trash2, Send,
  Upload, MessageSquare, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { useBudgetStore, type BudgetRequest, type BudgetStatus } from "@/store/budget-store";
import { BudgetApprovalQueue } from "@/components/shared/BudgetApprovalQueue";
import { PermissionGate } from "@/components/shared/PermissionGate";
import client from "@/lib/api/client";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CampaignExpense {
  id: number;
  platform: string;
  description: string;
  amount_planned: number;
  amount_spent: number;
  currency: string;
  spend_date: string;
  social_proof_url?: string | null;
  proof_file_name?: string | null;
  status: "pending" | "approved" | "rejected";
  review_notes?: string | null;
  balance_remaining?: number;
  is_overspend?: boolean;
  overspend_amount?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

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

const CATEGORIES = ["Digital Ads", "Events", "Print", "Influencer", "Tools & Software", "PR", "Other"];
const PERIODS    = ["Q1-2026", "Q2-2026", "Q3-2026", "Q4-2026", "2026-04", "2026-05", "2026-06"];
const PLATFORMS  = ["Facebook", "Instagram", "Twitter/X", "LinkedIn", "Google Ads", "TikTok", "YouTube", "Other"];

// ── Proof Upload Form ─────────────────────────────────────────────────────────

function ProofUploadForm({
  budget,
  onSuccess,
}: {
  budget: BudgetRequest;
  onSuccess: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    platform:       PLATFORMS[0],
    description:    "",
    amount_planned: budget.amount_requested.toString(),
    amount_spent:   "",
    spend_date:     new Date().toISOString().split("T")[0],
    social_proof_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.description || !form.amount_spent) return;
    setUploading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("department_budget_id", String(budget.id));
      data.append("platform",       form.platform);
      data.append("description",    form.description);
      data.append("amount_planned", form.amount_planned);
      data.append("amount_spent",   form.amount_spent);
      data.append("currency",       budget.currency);
      data.append("spend_date",     form.spend_date);
      if (form.social_proof_url) data.append("social_proof_url", form.social_proof_url);
      if (fileRef.current?.files?.[0]) {
        data.append("proof_file", fileRef.current.files[0]);
      }

      await client.post("/api/v1/campaign-expenses", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to upload proof";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const spent    = parseFloat(form.amount_spent || "0");
  const planned  = parseFloat(form.amount_planned || "0");
  const isOver   = spent > planned;
  const balance  = planned - spent;

  return (
    <div className="mt-3 rounded-xl border border-border bg-muted/30 p-4 space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Upload Proof of Payment</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1">Platform / Channel</label>
          <select
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
          >
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Spend Date</label>
          <input
            type="date"
            value={form.spend_date}
            onChange={(e) => setForm({ ...form, spend_date: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Amount Planned ({budget.currency})</label>
          <input
            type="number"
            min={0}
            value={form.amount_planned}
            onChange={(e) => setForm({ ...form, amount_planned: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            Amount Spent ({budget.currency}) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            value={form.amount_spent}
            onChange={(e) => setForm({ ...form, amount_spent: e.target.value })}
            className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none ${
              isOver ? "border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50" : "border-border bg-background focus:ring-2 focus:ring-primary"
            }`}
            placeholder="0"
          />
          {form.amount_spent && (
            <p className={`text-xs mt-1 ${isOver ? "text-red-600 font-semibold" : "text-green-600"}`}>
              {isOver
                ? `Overspend: +${budget.currency} ${Math.abs(balance).toLocaleString()} above planned`
                : `Balance remaining: ${budget.currency} ${balance.toLocaleString()}`}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g. Facebook awareness campaign — April week 2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1">Social Media / Ad Proof URL (optional)</label>
          <input
            type="url"
            value={form.social_proof_url}
            onChange={(e) => setForm({ ...form, social_proof_url: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none"
            placeholder="https://ads.facebook.com/…"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Proof of Payment (screenshot / PDF)</label>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground"
          />
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or PDF · max 10 MB</p>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      <button
        disabled={uploading || !form.description || !form.amount_spent}
        onClick={handleSubmit}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        <Upload size={14} />
        {uploading ? "Uploading…" : "Submit Proof"}
      </button>
    </div>
  );
}

// ── Budget Row with expandable proof section ──────────────────────────────────

function BudgetRow({
  budget,
  onSubmit,
  onDelete,
  currentUserId,
  onRespondToQuery,
}: {
  budget: BudgetRequest;
  onSubmit: (id: number) => void;
  onDelete: (id: number) => void;
  currentUserId?: number;
  onRespondToQuery: (budget: BudgetRequest) => void;
}) {
  const [expanded, setExpanded]   = useState(false);
  const [expenses, setExpenses]   = useState<CampaignExpense[]>([]);
  const [loadingExp, setLoadingExp] = useState(false);
  const [showProofForm, setShowProofForm] = useState(false);

  const loadExpenses = async () => {
    setLoadingExp(true);
    try {
      const res = await client.get("/api/v1/campaign-expenses", {
        params: { department_budget_id: budget.id },
      });
      setExpenses(res.data?.data ?? res.data ?? []);
    } catch {
      // non-fatal
    } finally {
      setLoadingExp(false);
    }
  };

  const handleToggle = () => {
    if (!expanded && budget.status === "approved") loadExpenses();
    setExpanded((v) => !v);
  };

  const isQueried     = budget.status === "queried";
  const isOwn         = currentUserId && budget.submitted_by === currentUserId;
  const totalSpent    = expenses.reduce((s, e) => s + Number(e.amount_spent), 0);
  const totalPlanned  = Number(budget.amount_requested);
  const isOver        = totalSpent > totalPlanned;

  return (
    <div className="bg-card">
      <div className="flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors">
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
          {/* CEO query — creator needs to respond */}
          {isQueried && isOwn && budget.ceo_query_notes && (
            <div className="mt-2 p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-800">
              <span className="font-semibold">CEO query:</span> {budget.ceo_query_notes}
              {budget.ceo_suggested_amount && (
                <span className="ml-2 font-semibold">
                  · Suggested: ₦{Number(budget.ceo_suggested_amount).toLocaleString()}
                </span>
              )}
            </div>
          )}
          {/* Approved: show spend summary */}
          {budget.status === "approved" && expenses.length > 0 && (
            <div className={`text-xs mt-1 font-medium ${isOver ? "text-red-600" : "text-green-600"}`}>
              Spent: ₦{totalSpent.toLocaleString()} / ₦{totalPlanned.toLocaleString()}
              {isOver && ` · Overspend: +₦${(totalSpent - totalPlanned).toLocaleString()}`}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {budget.status === "draft" && (
            <>
              <PermissionGate resource="budget" permission="write">
                <button
                  onClick={() => onSubmit(budget.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Send size={12} /> Submit
                </button>
              </PermissionGate>
              <PermissionGate resource="budget" permission="delete">
                <button
                  onClick={() => onDelete(budget.id)}
                  className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </PermissionGate>
            </>
          )}

          {/* Creator responds to CEO query */}
          {isQueried && isOwn && (
            <button
              onClick={() => onRespondToQuery(budget)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
            >
              <MessageSquare size={12} /> Respond
            </button>
          )}

          {/* Expand proof section for approved budgets */}
          {budget.status === "approved" && (
            <button
              onClick={handleToggle}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
            >
              <Upload size={12} /> Proof
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable proof / expenses section */}
      {expanded && budget.status === "approved" && (
        <div className="px-4 pb-4 border-t border-border">
          {loadingExp ? (
            <div className="py-4 flex justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {expenses.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Submitted Expenses</p>
                  {expenses.map((exp) => (
                    <div key={exp.id} className="rounded-xl border border-border bg-muted/20 p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{exp.platform} · {exp.description}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          exp.status === "approved" ? "bg-green-100 text-green-700" :
                          exp.status === "rejected" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {exp.status}
                        </span>
                      </div>
                      <div className="text-muted-foreground space-x-3">
                        <span>Planned: ₦{Number(exp.amount_planned).toLocaleString()}</span>
                        <span className={exp.is_overspend ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                          Spent: ₦{Number(exp.amount_spent).toLocaleString()}
                          {exp.is_overspend && ` (+₦${Number(exp.overspend_amount).toLocaleString()} over)`}
                        </span>
                        <span>{exp.spend_date}</span>
                      </div>
                      {exp.proof_file_name && (
                        <p className="text-muted-foreground">Proof: {exp.proof_file_name}</p>
                      )}
                      {exp.review_notes && (
                        <p className="text-muted-foreground">Note: {exp.review_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!showProofForm ? (
                <button
                  onClick={() => setShowProofForm(true)}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <PlusCircle size={13} /> Upload new proof of payment
                </button>
              ) : (
                <ProofUploadForm
                  budget={budget}
                  onSuccess={() => {
                    setShowProofForm(false);
                    loadExpenses();
                  }}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MarketingBudgetPage() {
  const { budgets, isLoading, fetchBudgets, createBudget, submitBudget, deleteBudget, respondToQuery } =
    useBudgetStore();

  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title:            "",
    category:         CATEGORIES[0],
    description:      "",
    amount_requested: "",
    period:           PERIODS[0],
  });

  // Respond-to-query modal
  const [respondBudget, setRespondBudget]   = useState<BudgetRequest | null>(null);
  const [responseText, setResponseText]     = useState("");
  const [responding, setResponding]         = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!form.title || !form.amount_requested) return;
    setSubmitting(true);
    try {
      await createBudget({
        department:        "marketing",
        category:          form.category,
        title:             form.title,
        description:       form.description,
        amount_requested:  parseFloat(form.amount_requested),
        currency:          "NGN",
        period:            form.period,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketing Budget</h1>
          <p className="text-sm text-muted-foreground">
            Submit and track budget requests. Approvals go COO → CEO → Finance.
          </p>
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

      {/* New budget form */}
      {showForm && (
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
                placeholder="e.g. Q2 Facebook Ads"
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
                value={form.amount_requested}
                onChange={(e) => setForm({ ...form, amount_requested: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="500000"
                min="0"
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
            <label className="block text-xs font-semibold mb-1">Description / Justification</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Explain what this budget will be used for…"
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
          No budget requests yet. Click &ldquo;New Request&rdquo; to start.
        </div>
      ) : (
        <div className="divide-y divide-border rounded-2xl border overflow-hidden">
          {budgets.map((budget) => (
            <BudgetRow
              key={budget.id}
              budget={budget}
              onSubmit={submitBudget}
              onDelete={(id) => {
                if (!confirm("Delete this draft?")) return;
                deleteBudget(id);
              }}
              onRespondToQuery={(b) => { setRespondBudget(b); setResponseText(""); }}
            />
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
                  CEO suggested: {respondBudget.currency} {Number(respondBudget.ceo_suggested_amount).toLocaleString()}
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
                placeholder="Explain why this amount is necessary, or address the CEO's concern…"
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

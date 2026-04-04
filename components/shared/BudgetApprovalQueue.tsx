"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, ChevronRight, MessageSquare, AlertCircle } from "lucide-react";
import { useBudgetStore, type BudgetRequest, type BudgetStatus } from "@/store/budget-store";

// Which status to show for each approver role
const ROLE_PENDING_STATUS: Record<string, BudgetStatus> = {
  coo:       "pending_coo",
  ceo:       "pending_ceo",
  president: "pending_ceo",
  finance:   "pending_finance",
  cfo:       "pending_finance",
};

const STATUS_LABEL: Record<BudgetStatus, string> = {
  draft:           "Draft",
  pending_coo:     "Awaiting COO",
  pending_ceo:     "Awaiting CEO",
  queried:         "Queried — Awaiting Creator",
  pending_finance: "Awaiting Finance",
  approved:        "Approved",
  rejected:        "Rejected",
};

const STATUS_COLOR: Record<BudgetStatus, string> = {
  draft:           "bg-gray-100 text-gray-600",
  pending_coo:     "bg-amber-100 text-amber-700",
  pending_ceo:     "bg-amber-100 text-amber-700",
  queried:         "bg-purple-100 text-purple-700",
  pending_finance: "bg-blue-100 text-blue-700",
  approved:        "bg-green-100 text-green-700",
  rejected:        "bg-red-100 text-red-700",
};

type ActionType = "approve" | "reject" | "query" | "respond";

interface Props {
  /** The approver role — determines which queue to show and which action to invoke */
  role: "coo" | "ceo" | "president" | "finance" | "cfo" | "admin" | "super_admin";
  /** Show all budgets (admin view) — overrides role filtering */
  showAll?: boolean;
  /** Current user ID — used to gate the "respond" action to the original submitter */
  currentUserId?: number;
}

export function BudgetApprovalQueue({ role, showAll = false, currentUserId }: Props) {
  const {
    budgets, isLoading, fetchBudgets,
    approveCoo, approveCeo, approveFinance, rejectBudget, queryCeo, respondToQuery,
  } = useBudgetStore();

  const [selectedBudget, setSelectedBudget]     = useState<BudgetRequest | null>(null);
  const [notes, setNotes]                       = useState("");
  const [rejectReason, setRejectReason]         = useState("");
  const [queryNotes, setQueryNotes]             = useState("");
  const [suggestedAmount, setSuggestedAmount]   = useState("");
  const [creatorResponse, setCreatorResponse]   = useState("");
  const [action, setAction]                     = useState<ActionType | null>(null);
  const [processing, setProcessing]             = useState(false);

  const pendingStatus = ROLE_PENDING_STATUS[role];
  const isCeo = role === "ceo" || role === "president";

  useEffect(() => {
    if (showAll) {
      fetchBudgets({});
    } else if (isCeo) {
      // CEO sees both pending_ceo and queried (creator has responded) budgets
      fetchBudgets({ status: "pending_ceo" });
    } else if (pendingStatus) {
      fetchBudgets({ status: pendingStatus });
    }
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async () => {
    if (!selectedBudget) return;
    setProcessing(true);
    try {
      if (role === "coo") await approveCoo(selectedBudget.id, notes || undefined);
      else if (isCeo)     await approveCeo(selectedBudget.id, notes || undefined);
      else                await approveFinance(selectedBudget.id, notes || undefined);
      closeModal();
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBudget || !rejectReason.trim()) return;
    setProcessing(true);
    try {
      await rejectBudget(selectedBudget.id, rejectReason);
      closeModal();
    } finally {
      setProcessing(false);
    }
  };

  const handleQuery = async () => {
    if (!selectedBudget || !queryNotes.trim()) return;
    setProcessing(true);
    try {
      const amount = suggestedAmount ? parseFloat(suggestedAmount) : undefined;
      await queryCeo(selectedBudget.id, queryNotes, amount);
      closeModal();
    } finally {
      setProcessing(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedBudget || !creatorResponse.trim()) return;
    setProcessing(true);
    try {
      await respondToQuery(selectedBudget.id, creatorResponse);
      closeModal();
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedBudget(null);
    setAction(null);
    setNotes("");
    setRejectReason("");
    setQueryNotes("");
    setSuggestedAmount("");
    setCreatorResponse("");
  };

  const isApprover = ["coo", "ceo", "president", "finance", "cfo"].includes(role);

  // Budgets where the creator can respond (queried and user is the submitter)
  const canRespond = (b: BudgetRequest) =>
    b.status === "queried" && currentUserId && b.submitted_by === currentUserId;

  return (
    <div className="space-y-4">
      {/* Budget list */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No budget requests to review.
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border overflow-hidden">
          {budgets.map((budget) => (
            <div key={budget.id} className="flex items-center gap-4 p-4 bg-card hover:bg-muted/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm truncate">{budget.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[budget.status]}`}>
                    {STATUS_LABEL[budget.status]}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-x-3">
                  <span>{budget.department} · {budget.category}</span>
                  <span>{budget.period}</span>
                  <span className="font-medium text-foreground">
                    {budget.currency} {Number(budget.amount_requested).toLocaleString()}
                  </span>
                </div>
                {budget.submittedBy && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Submitted by {budget.submittedBy.first_name} {budget.submittedBy.last_name}
                  </div>
                )}
                {/* Show CEO query note when queried */}
                {budget.status === "queried" && budget.ceo_query_notes && (
                  <div className="mt-1.5 text-xs bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-1.5 text-purple-800">
                    <span className="font-semibold">CEO query:</span> {budget.ceo_query_notes}
                    {budget.ceo_suggested_amount && (
                      <span className="ml-2 font-semibold">
                        · Suggested: {budget.currency} {Number(budget.ceo_suggested_amount).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                {/* Standard approve / reject for current approver's queue */}
                {isApprover && budget.status === pendingStatus && (
                  <>
                    <button
                      onClick={() => { setSelectedBudget(budget); setAction("approve"); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    {/* CEO can query before approving */}
                    {isCeo && (
                      <button
                        onClick={() => { setSelectedBudget(budget); setAction("query"); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
                      >
                        <MessageSquare size={13} /> Query
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedBudget(budget); setAction("reject"); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}

                {/* CEO reviewing a queried budget that has a creator response */}
                {isCeo && budget.status === "queried" && budget.creator_response && (
                  <>
                    <button
                      onClick={() => { setSelectedBudget(budget); setAction("approve"); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      onClick={() => { setSelectedBudget(budget); setAction("reject"); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}

                {/* Creator responds to CEO query */}
                {canRespond(budget) && (
                  <button
                    onClick={() => { setSelectedBudget(budget); setAction("respond"); }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
                  >
                    <AlertCircle size={13} /> Respond
                  </button>
                )}
              </div>

              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Action modal */}
      {selectedBudget && action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="font-bold text-lg">
              {action === "approve" && "Approve Budget"}
              {action === "reject"  && "Reject Budget"}
              {action === "query"   && "Query Budget — Request Clarification"}
              {action === "respond" && "Respond to CEO Query"}
            </h2>

            <div className="text-sm space-y-1 p-3 bg-muted rounded-xl">
              <p className="font-semibold">{selectedBudget.title}</p>
              <p className="text-muted-foreground">
                {selectedBudget.currency} {Number(selectedBudget.amount_requested).toLocaleString()} · {selectedBudget.period}
              </p>
              {selectedBudget.description && (
                <p className="text-muted-foreground text-xs mt-1">{selectedBudget.description}</p>
              )}
            </div>

            {action === "approve" && (
              <div>
                <label className="block text-xs font-semibold mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Any comments for the next reviewer…"
                />
              </div>
            )}

            {action === "reject" && (
              <div>
                <label className="block text-xs font-semibold mb-1">Rejection reason <span className="text-red-500">*</span></label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-destructive"
                  placeholder="Explain why this budget is being rejected…"
                />
              </div>
            )}

            {action === "query" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Query / clarification needed <span className="text-red-500">*</span></label>
                  <textarea
                    value={queryNotes}
                    onChange={(e) => setQueryNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="What information or justification do you need from the submitter?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Suggested amount ({selectedBudget.currency}) <span className="text-muted-foreground font-normal">optional</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={suggestedAmount}
                    onChange={(e) => setSuggestedAmount(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={`e.g. ${Number(selectedBudget.amount_requested * 0.8).toLocaleString()}`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    If the amount seems too high, propose a counter-figure here.
                  </p>
                </div>
              </div>
            )}

            {action === "respond" && (
              <div className="space-y-3">
                {selectedBudget.ceo_query_notes && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 space-y-1">
                    <p className="font-semibold">CEO query:</p>
                    <p>{selectedBudget.ceo_query_notes}</p>
                    {selectedBudget.ceo_suggested_amount && (
                      <p className="font-semibold mt-1">
                        Suggested amount: {selectedBudget.currency} {Number(selectedBudget.ceo_suggested_amount).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold mb-1">Your response <span className="text-red-500">*</span></label>
                  <textarea
                    value={creatorResponse}
                    onChange={(e) => setCreatorResponse(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Explain why this amount is needed or address the CEO's concerns…"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={
                  processing ||
                  (action === "reject"  && !rejectReason.trim()) ||
                  (action === "query"   && !queryNotes.trim()) ||
                  (action === "respond" && !creatorResponse.trim())
                }
                onClick={
                  action === "approve" ? handleApprove :
                  action === "reject"  ? handleReject  :
                  action === "query"   ? handleQuery   :
                                        handleRespond
                }
                className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 ${
                  action === "approve" ? "bg-green-600 hover:bg-green-700" :
                  action === "reject"  ? "bg-red-600 hover:bg-red-700"    :
                  action === "query"   ? "bg-purple-600 hover:bg-purple-700" :
                                        "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {processing ? "Processing…" :
                  action === "approve" ? "Confirm Approval"   :
                  action === "reject"  ? "Confirm Rejection"  :
                  action === "query"   ? "Send Query"         :
                                        "Submit Response"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle, XCircle, MessageSquare, Clock, ChevronRight,
  AlertTriangle, CheckCircle2, Circle,
} from "lucide-react";
import { useApprovalStore, type ApprovalRequest, type ApprovalStatus } from "@/store/approval-store";
import { formatDistanceToNow } from "date-fns";

// ── Visual maps ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<ApprovalStatus, string> = {
  pending:      "bg-amber-100 text-amber-700",
  under_review: "bg-blue-100 text-blue-700",
  approved:     "bg-green-100 text-green-700",
  rejected:     "bg-red-100 text-red-700",
  cancelled:    "bg-gray-100 text-gray-500",
  escalated:    "bg-orange-100 text-orange-700",
};

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending:      "Pending",
  under_review: "Needs Info",
  approved:     "Approved",
  rejected:     "Rejected",
  cancelled:    "Cancelled",
  escalated:    "Escalated",
};

const TYPE_LABEL: Record<string, string> = {
  leave:       "Leave Request",
  budget:      "Budget Request",
  promotion:   "Promotion",
  transfer:    "Transfer",
  termination: "Termination",
  expense:     "Expense Claim",
  custom:      "Custom",
};

// ── Step progress bar ──────────────────────────────────────────────────────────

function StepProgress({ request }: { request: ApprovalRequest }) {
  return (
    <div className="flex items-center gap-1 mt-2">
      {request.steps.map((step, i) => {
        const done    = step.status === "approved";
        const current = step.step_number === request.current_step && request.status === "pending";
        const rejected = step.status === "rejected";
        return (
          <div key={i} className="flex items-center gap-1">
            <div
              title={step.step_label}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                done    ? "bg-green-500 text-white" :
                rejected ? "bg-red-500 text-white" :
                current  ? "bg-amber-400 text-white" :
                           "bg-muted text-muted-foreground"
              }`}
            >
              {done ? "✓" : rejected ? "✗" : step.step_number}
            </div>
            {i < request.steps.length - 1 && (
              <div className={`h-0.5 w-4 ${done ? "bg-green-400" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
      <span className="ml-1 text-[10px] text-muted-foreground">
        Step {request.current_step}/{request.total_steps}
      </span>
    </div>
  );
}

// ── Action modal ───────────────────────────────────────────────────────────────

type ActionType = "approve" | "reject" | "review" | "respond";

interface ActionModalProps {
  request: ApprovalRequest;
  action: ActionType;
  onClose: () => void;
  onDone: () => void;
}

function ActionModal({ request, action, onClose, onDone }: ActionModalProps) {
  const { approve, reject, requestReview, respond } = useApprovalStore();
  const [text, setText]         = useState("");
  const [processing, setProcessing] = useState(false);

  const currentStep = request.steps.find((s) => s.step_number === request.current_step);

  const handleSubmit = async () => {
    if (!text.trim() && action !== "approve") return;
    setProcessing(true);
    try {
      if (action === "approve")  await approve(request.uuid, text || undefined);
      if (action === "reject")   await reject(request.uuid, text);
      if (action === "review")   await requestReview(request.uuid, text);
      if (action === "respond")  await respond(request.uuid, text);
      onDone();
    } finally {
      setProcessing(false);
    }
  };

  const config = {
    approve: {
      title: "Approve Request",
      placeholder: "Optional notes for the next reviewer…",
      required: false,
      color: "bg-green-600 hover:bg-green-700",
      label: "Confirm Approval",
    },
    reject: {
      title: "Reject Request",
      placeholder: "Explain why this is being rejected (required)…",
      required: true,
      color: "bg-red-600 hover:bg-red-700",
      label: "Confirm Rejection",
    },
    review: {
      title: "Request More Information",
      placeholder: "What additional information do you need from the submitter?",
      required: true,
      color: "bg-blue-600 hover:bg-blue-700",
      label: "Send Back for Info",
    },
    respond: {
      title: "Respond to Reviewer",
      placeholder: "Provide the requested information…",
      required: true,
      color: "bg-primary hover:opacity-90",
      label: "Submit Response",
    },
  }[action];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <h2 className="font-bold text-lg">{config.title}</h2>

        {/* Request summary */}
        <div className="rounded-xl bg-muted p-3 text-sm space-y-1">
          <p className="font-semibold">{request.title}</p>
          <p className="text-muted-foreground text-xs">
            {TYPE_LABEL[request.type]} · by {request.requester?.first_name} {request.requester?.last_name}
          </p>
          {currentStep && action !== "respond" && (
            <p className="text-xs text-muted-foreground">Current step: {currentStep.step_label}</p>
          )}
          {action === "respond" && currentStep?.action_notes && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs">
              <p className="font-semibold text-blue-700 dark:text-blue-300">Reviewer asked:</p>
              <p className="text-blue-600 dark:text-blue-400 mt-0.5">{currentStep.action_notes}</p>
            </div>
          )}
        </div>

        {request.description && (
          <p className="text-xs text-muted-foreground">{request.description}</p>
        )}

        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder={config.placeholder}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={processing || (config.required && !text.trim())}
            onClick={handleSubmit}
            className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 ${config.color}`}
          >
            {processing ? "Processing…" : config.label}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Request card ───────────────────────────────────────────────────────────────

interface RequestCardProps {
  request: ApprovalRequest;
  /** Whether the viewing user is an approver for the current step */
  isApproverForCurrentStep: boolean;
  /** Whether the viewing user is the requester AND request is under_review */
  canRespond: boolean;
  onAction: (req: ApprovalRequest, action: ActionType) => void;
}

function RequestCard({ request, isApproverForCurrentStep, canRespond, onAction }: RequestCardProps) {
  return (
    <div className="p-4 bg-card rounded-2xl border border-border space-y-3 hover:shadow-sm transition-shadow">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate">{request.title}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[request.status]}`}>
              {STATUS_LABEL[request.status]}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {TYPE_LABEL[request.type]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {request.requester
              ? `${request.requester.first_name} ${request.requester.last_name}`
              : "Unknown"
            }
            {" · "}
            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Step progress */}
      <StepProgress request={request} />

      {/* Under review — reviewer's question */}
      {request.status === "under_review" && (() => {
        const step = request.steps.find((s) => s.step_number === request.current_step);
        return step?.action_notes ? (
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-2 text-xs text-blue-700 dark:text-blue-300">
            <span className="font-semibold">More info needed: </span>{step.action_notes}
          </div>
        ) : null;
      })()}

      {/* Rejection reason */}
      {request.status === "rejected" && (() => {
        const step = request.steps.find((s) => s.status === "rejected");
        return step?.action_notes ? (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-2 text-xs text-red-700 dark:text-red-300">
            <span className="font-semibold">Rejected: </span>{step.action_notes}
          </div>
        ) : null;
      })()}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap pt-1">
        {isApproverForCurrentStep && request.status === "pending" && (
          <>
            <button
              onClick={() => onAction(request, "approve")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
            >
              <CheckCircle size={12} /> Approve
            </button>
            <button
              onClick={() => onAction(request, "reject")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
            >
              <XCircle size={12} /> Reject
            </button>
            <button
              onClick={() => onAction(request, "review")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
            >
              <MessageSquare size={12} /> Ask for Info
            </button>
          </>
        )}
        {canRespond && (
          <button
            onClick={() => onAction(request, "respond")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <MessageSquare size={12} /> Respond
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  /** Filter by approval type */
  filterType?: string;
  /** Show "My Requests" tab or only "Inbox" */
  showTabs?: boolean;
}

export function ApprovalInbox({ filterType, showTabs = true }: Props) {
  const { requests, isLoading, fetchRequests, fetchInbox } = useApprovalStore();
  const [sessionUser, setSessionUser] = useState<{ id: string | number | null; roles: string[] }>({
    id: null,
    roles: [],
  });
  const [tab, setTab]       = useState<"inbox" | "mine">("inbox");
  const [active, setActive] = useState<{ req: ApprovalRequest; action: ActionType } | null>(null);

  // Grab current user id from cookie/localStorage
  const currentUserId = sessionUser.id;
  const currentRoles = sessionUser.roles;

  useEffect(() => {
    fetchRequests(filterType ? { type: filterType as never } : {});
    fetchInbox();
  }, [filterType]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session/me", {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          user?: { id?: string | number | null; all_roles?: string[]; role?: { slug?: string } };
        };
        const user = payload.user;
        const roles = Array.isArray(user?.all_roles)
          ? user.all_roles
          : user?.role?.slug
            ? [user.role.slug]
            : [];
        setSessionUser({ id: user?.id ?? null, roles });
      } catch {
        setSessionUser({ id: null, roles: [] });
      }
    };
    void loadSession();
  }, []);

  const onAction = (req: ApprovalRequest, action: ActionType) => setActive({ req, action });
  const closeModal = () => setActive(null);
  const onDone = () => {
    setActive(null);
    fetchRequests(filterType ? { type: filterType as never } : {});
    fetchInbox();
  };

  // Filter: inbox = requests where I'm the current step approver
  const inbox = requests.filter((r) => {
    if (r.status !== "pending") return false;
    const step = r.steps.find((s) => s.step_number === r.current_step);
    return (
      step?.approver_id === currentUserId ||
      (step?.approver_role && currentRoles.includes(step.approver_role))
    );
  });

  // Filter: my requests
  const mine = requests.filter((r) => r.requested_by === currentUserId);

  const displayed = tab === "inbox" ? inbox : mine;

  return (
    <div className="space-y-4">
      {showTabs && (
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
          <button
            onClick={() => setTab("inbox")}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === "inbox" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Inbox
            {inbox.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] h-[18px] px-1">
                {inbox.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("mine")}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === "mine" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Requests
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-16 text-center">
          <CheckCircle2 size={36} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {tab === "inbox" ? "No pending approvals in your inbox." : "No requests submitted yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((req) => {
            const currentStep = req.steps.find((s) => s.step_number === req.current_step);
            const isApprover  = Boolean(
              currentStep?.approver_id === currentUserId ||
              (currentStep?.approver_role && currentRoles.includes(currentStep.approver_role))
            );
            const canRespond = req.status === "under_review" && req.requested_by === currentUserId;

            return (
              <RequestCard
                key={req.uuid}
                request={req}
                isApproverForCurrentStep={isApprover}
                canRespond={canRespond}
                onAction={onAction}
              />
            );
          })}
        </div>
      )}

      {active && (
        <ActionModal
          request={active.req}
          action={active.action}
          onClose={closeModal}
          onDone={onDone}
        />
      )}
    </div>
  );
}

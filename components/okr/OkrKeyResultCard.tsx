"use client";

import { useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  RefreshCw,
  Zap,
} from "lucide-react";
import type { OkrInitiativeStatus, OkrKeyResult } from "@/types/okr";
import { okrService } from "@/lib/api/okr";
import { OkrHealthBadge } from "./OkrHealthBadge";
import { OkrProgressBar } from "./OkrProgressBar";

interface OkrKeyResultCardProps {
  kr: OkrKeyResult;
  canManage: boolean;
  onUpdated: (kr: OkrKeyResult) => void;
  onAddInitiative?: (krId: number) => void;
}

const INITIATIVE_STATUS_LABELS: Record<
  OkrInitiativeStatus,
  { label: string; color: string }
> = {
  not_started: { label: "Not started", color: "text-[rgba(31,22,15,0.4)]" },
  in_progress: { label: "In progress", color: "text-[#9bb068]" },
  completed: { label: "Completed", color: "text-[#5a7a2e]" },
  blocked: { label: "Blocked", color: "text-[#fe814b]" },
};

export function OkrKeyResultCard({
  kr,
  canManage,
  onUpdated,
  onAddInitiative,
}: OkrKeyResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInValue, setCheckInValue] = useState("");
  const [checkInNote, setCheckInNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    const val = parseFloat(checkInValue);
    if (Number.isNaN(val)) {
      setError("Enter a valid number.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await okrService.checkIn(kr.id, {
        value: val,
        note: checkInNote || undefined,
      });
      if (res?.key_result) {
        onUpdated(res.key_result);
        setCheckingIn(false);
        setCheckInValue("");
        setCheckInNote("");
      }
    } catch {
      setError("Failed to submit check-in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isAutoRefreshed = kr.metric_type === "auto";
  const lastRefreshed = kr.last_refreshed_at
    ? new Date(kr.last_refreshed_at).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="rounded-2xl border border-[rgba(31,22,15,0.08)] bg-white overflow-hidden">
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <OkrHealthBadge health={kr.health_status} size="sm" />
              {isAutoRefreshed && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[rgba(31,22,15,0.4)] font-semibold">
                  <Zap className="w-2.5 h-2.5" /> Auto
                </span>
              )}
              {lastRefreshed && (
                <span className="text-[10px] text-[rgba(31,22,15,0.3)]">
                  Updated {lastRefreshed}
                </span>
              )}
            </div>
            <h4 className="text-sm font-semibold text-[#1f160f] leading-snug mb-0.5">
              {kr.title}
            </h4>
            {kr.owner && (
              <p className="text-[11px] text-[rgba(31,22,15,0.4)]">
                Owner: {kr.owner.first_name} {kr.owner.last_name}
              </p>
            )}
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="shrink-0 p-1.5 rounded-xl hover:bg-[rgba(31,22,15,0.05)] transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-[rgba(31,22,15,0.4)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[rgba(31,22,15,0.4)]" />
            )}
          </button>
        </div>

        <div className="mt-3">
          <OkrProgressBar
            progress={kr.progress}
            pace={kr.pace}
            health={kr.health_status}
            unit={kr.unit}
            currentValue={kr.current_value}
            targetValue={kr.target_value}
            showValues
          />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[rgba(31,22,15,0.06)] px-4 py-3 space-y-4">
          {kr.description && (
            <p className="text-xs text-[rgba(31,22,15,0.55)] leading-relaxed">
              {kr.description}
            </p>
          )}

          {kr.initiatives && kr.initiatives.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[rgba(31,22,15,0.4)] tracking-widest uppercase mb-2">
                Initiatives
              </p>
              <div className="space-y-1.5">
                {kr.initiatives.map((initiative) => {
                  const s = INITIATIVE_STATUS_LABELS[initiative.status];
                  return (
                    <div
                      key={initiative.id}
                      className="flex items-center gap-2.5 text-xs"
                    >
                      <CheckCircle
                        className={`w-3.5 h-3.5 shrink-0 ${
                          initiative.status === "completed"
                            ? "text-[#9bb068]"
                            : "text-[rgba(31,22,15,0.2)]"
                        }`}
                      />
                      <span
                        className={`flex-1 ${
                          initiative.status === "completed"
                            ? "line-through text-[rgba(31,22,15,0.4)]"
                            : "text-[rgba(31,22,15,0.7)]"
                        }`}
                      >
                        {initiative.title}
                      </span>
                      <span className={`text-[10px] font-semibold ${s.color}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(canManage || kr.can_check_in) && (
            <div className="flex items-center gap-2 flex-wrap">
              {kr.can_check_in && !isAutoRefreshed && !checkingIn && (
                <button
                  onClick={() => setCheckingIn(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#4b3425] text-white hover:opacity-90 transition-opacity"
                >
                  <RefreshCw className="w-3 h-3" /> Check In
                </button>
              )}
              {canManage && onAddInitiative && (
                <button
                  onClick={() => onAddInitiative(kr.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[rgba(31,22,15,0.12)] text-[rgba(31,22,15,0.6)] hover:bg-[rgba(31,22,15,0.04)] transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Initiative
                </button>
              )}
            </div>
          )}

          {checkingIn && (
            <div className="rounded-xl border border-[rgba(31,22,15,0.1)] bg-[rgba(31,22,15,0.02)] p-3 space-y-2.5">
              <p className="text-xs font-bold text-[#1f160f]">
                Submit Check-In
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={checkInValue}
                  onChange={(e) => setCheckInValue(e.target.value)}
                  placeholder={`Current value (${kr.unit})`}
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-[rgba(31,22,15,0.12)] bg-white focus:outline-none focus:ring-2 focus:ring-[#9bb068]/40 focus:border-[#9bb068]"
                />
                <span className="text-xs text-[rgba(31,22,15,0.4)] shrink-0">
                  / {kr.target_value.toLocaleString()}
                </span>
              </div>
              <textarea
                value={checkInNote}
                onChange={(e) => setCheckInNote(e.target.value)}
                placeholder="Add a note (optional)"
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[rgba(31,22,15,0.12)] bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#9bb068]/40 focus:border-[#9bb068]"
              />
              {error && <p className="text-xs text-[#fe814b]">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleCheckIn}
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-[#9bb068] text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
                <button
                  onClick={() => {
                    setCheckingIn(false);
                    setError(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[rgba(31,22,15,0.12)] text-[rgba(31,22,15,0.6)] hover:bg-[rgba(31,22,15,0.04)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

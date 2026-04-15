"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Target } from "lucide-react";
import type { OkrKeyResult, OkrObjective } from "@/types/okr";
import { OkrHealthBadge } from "./OkrHealthBadge";
import { OkrKeyResultCard } from "./OkrKeyResultCard";
import { OkrProgressBar } from "./OkrProgressBar";

interface OkrObjectiveCardProps {
  objective: OkrObjective;
  canManage: boolean;
  onAddKR?: (objectiveId: number) => void;
  onAddInitiative?: (krId: number) => void;
  onKrUpdated?: (kr: OkrKeyResult) => void;
  isChild?: boolean;
}

export function OkrObjectiveCard({
  objective,
  canManage,
  onAddKR,
  onAddInitiative,
  onKrUpdated,
  isChild = false,
}: OkrObjectiveCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [krs, setKrs] = useState<OkrKeyResult[]>(objective.key_results ?? []);

  const handleKrUpdated = (updated: OkrKeyResult) => {
    setKrs((prev) => prev.map((kr) => (kr.id === updated.id ? updated : kr)));
    onKrUpdated?.(updated);
  };

  const { krs_summary } = objective;

  return (
    <div
      className={`rounded-2xl border ${
        isChild
          ? "border-[rgba(31,22,15,0.06)] bg-[rgba(31,22,15,0.015)]"
          : "border-[rgba(31,22,15,0.1)] bg-white shadow-sm"
      } overflow-hidden`}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-[rgba(31,22,15,0.02)] transition-colors"
      >
        <span className="mt-0.5 shrink-0 text-[rgba(31,22,15,0.3)]">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <OkrHealthBadge health={objective.health} />
            {objective.department && (
              <span className="text-[10px] font-semibold text-[rgba(31,22,15,0.35)] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgba(31,22,15,0.05)]">
                {objective.department}
              </span>
            )}
            <span className="text-[10px] text-[rgba(31,22,15,0.35)] ml-auto">
              On {krs_summary.on_track} | Risk {krs_summary.at_risk} | Off{" "}
              {krs_summary.off_track}
            </span>
          </div>

          <h3
            className={`font-bold text-[#1f160f] leading-snug ${
              isChild ? "text-sm" : "text-base"
            }`}
          >
            {objective.title}
          </h3>

          {objective.owner && (
            <p className="text-xs text-[rgba(31,22,15,0.4)] mt-0.5">
              {objective.owner.first_name} {objective.owner.last_name}
            </p>
          )}

          <div className="mt-3">
            <OkrProgressBar
              progress={objective.progress}
              health={objective.health}
              compact
              showValues={false}
            />
            <div className="flex justify-between mt-1 text-[10px] text-[rgba(31,22,15,0.4)]">
              <span>
                {krs_summary.total} key result
                {krs_summary.total !== 1 ? "s" : ""}
              </span>
              <span className="font-bold">
                {Math.round(objective.progress)}% avg progress
              </span>
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3">
          {objective.children?.map((child) => (
            <OkrObjectiveCard
              key={child.id}
              objective={child}
              canManage={canManage}
              onAddKR={onAddKR}
              onAddInitiative={onAddInitiative}
              onKrUpdated={onKrUpdated}
              isChild
            />
          ))}

          {krs.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-[rgba(31,22,15,0.4)] tracking-widest uppercase pt-1">
                Key Results
              </p>
              {krs.map((kr) => (
                <OkrKeyResultCard
                  key={kr.id}
                  kr={kr}
                  canManage={canManage}
                  onUpdated={handleKrUpdated}
                  onAddInitiative={onAddInitiative}
                />
              ))}
            </div>
          )}

          {canManage && onAddKR && (
            <button
              onClick={() => onAddKR(objective.id)}
              className="flex items-center gap-2 text-xs font-semibold text-[rgba(31,22,15,0.45)] hover:text-[#4b3425] transition-colors py-1 group"
            >
              <span className="w-5 h-5 rounded-full border border-dashed border-[rgba(31,22,15,0.2)] flex items-center justify-center group-hover:border-[#4b3425] transition-colors">
                <Plus className="w-3 h-3" />
              </span>
              Add Key Result
            </button>
          )}

          {krs.length === 0 && !objective.children?.length && (
            <div className="text-center py-6">
              <Target className="w-6 h-6 text-[rgba(31,22,15,0.15)] mx-auto mb-2" />
              <p className="text-xs text-[rgba(31,22,15,0.4)]">
                No key results yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

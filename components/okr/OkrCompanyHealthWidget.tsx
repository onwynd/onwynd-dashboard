"use client";

import { useEffect, useState } from "react";
import { okrService } from "@/lib/api/okr";
import type { OkrCompanyHealthResponse } from "@/types/okr";
import { OkrHealthBadge } from "./OkrHealthBadge";

interface OkrCompanyHealthWidgetProps {
  quarter?: string;
  compact?: boolean;
  okrHref?: string;
}

export function OkrCompanyHealthWidget({
  quarter,
  compact = false,
  okrHref = "/okr",
}: OkrCompanyHealthWidgetProps) {
  const [data, setData] = useState<OkrCompanyHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    okrService
      .getCompanyHealth(quarter)
      .then((res) => {
        if (res) setData(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [quarter]);

  if (loading) {
    return (
      <div
        className={`rounded-2xl bg-[rgba(31,22,15,0.04)] border border-[rgba(31,22,15,0.08)] ${
          compact ? "p-4" : "p-6"
        } animate-pulse`}
      >
        <div className="h-4 bg-[rgba(31,22,15,0.08)] rounded-lg w-1/2 mb-3" />
        <div className="h-12 bg-[rgba(31,22,15,0.08)] rounded-lg mb-3" />
        <div className="h-4 bg-[rgba(31,22,15,0.08)] rounded-lg w-3/4" />
      </div>
    );
  }

  if (!data) return null;

  const score = Math.round(data.health_score);
  const scoreColor =
    score >= 80 ? "#9bb068" : score >= 50 ? "#d4a800" : "#fe814b";
  const scoreLabel = score >= 80 ? "OK" : score >= 50 ? "RISK" : "ALERT";
  const { breakdown, attention_needed } = data;

  return (
    <div
      className={`rounded-2xl bg-white border border-[rgba(31,22,15,0.08)] shadow-sm ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-[rgba(31,22,15,0.4)] tracking-widest uppercase mb-0.5">
            Company Health
          </p>
          <p className="text-xs text-[rgba(31,22,15,0.5)]">{data.quarter}</p>
        </div>
        <a href={okrHref} className="text-xs font-semibold text-[#9bb068] hover:underline">
          View OKRs -&gt;
        </a>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div
          className="relative shrink-0"
          style={{ width: compact ? 56 : 72, height: compact ? 56 : 72 }}
        >
          <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke="rgba(31,22,15,0.08)"
              strokeWidth="8"
            />
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeDasharray={`${(score / 100) * 188.5} 188.5`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[9px] font-semibold text-[rgba(31,22,15,0.5)]">
              {scoreLabel}
            </span>
            <span
              className="font-extrabold text-[#1f160f]"
              style={{ fontSize: compact ? 14 : 18, lineHeight: 1 }}
            >
              {score}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          {(
            [
              ["on_track", "On Track", "#9bb068", breakdown.on_track],
              ["at_risk", "At Risk", "#d4a800", breakdown.at_risk],
              ["off_track", "Off Track", "#fe814b", breakdown.off_track],
            ] as const
          ).map(([, label, color, count]) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 text-xs text-[rgba(31,22,15,0.6)]">
                {label}
              </div>
              <div className="text-xs font-bold text-[#1f160f]">{count}</div>
              {breakdown.total > 0 && (
                <div className="text-[10px] text-[rgba(31,22,15,0.35)] w-8 text-right">
                  {Math.round((count / breakdown.total) * 100)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {attention_needed.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-[rgba(31,22,15,0.4)] tracking-widest uppercase mb-2">
            Needs Attention
          </p>
          <div className="space-y-1.5">
            {attention_needed.slice(0, compact ? 2 : 3).map((kr) => (
              <div
                key={kr.id}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-[rgba(31,22,15,0.03)] border border-[rgba(31,22,15,0.06)]"
              >
                <OkrHealthBadge health={kr.health} size="sm" showLabel={false} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1f160f] truncate">
                    {kr.title}
                  </p>
                  <p className="text-[10px] text-[rgba(31,22,15,0.4)] truncate">
                    {kr.objective}
                  </p>
                </div>
                <span className="text-xs font-bold text-[rgba(31,22,15,0.5)] shrink-0">
                  {Math.round(kr.progress)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

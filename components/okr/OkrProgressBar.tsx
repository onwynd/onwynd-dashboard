"use client";

import type { OkrHealth } from "@/types/okr";

interface OkrProgressBarProps {
  progress: number;
  pace?: number;
  health: OkrHealth;
  unit?: string;
  currentValue?: number;
  targetValue?: number;
  showValues?: boolean;
  compact?: boolean;
}

const BAR_COLOR: Record<OkrHealth, string> = {
  on_track: "bg-[#9bb068]",
  at_risk: "bg-[#d4a800]",
  off_track: "bg-[#fe814b]",
};

const TEXT_COLOR: Record<OkrHealth, string> = {
  on_track: "text-[#5a7a2e]",
  at_risk: "text-[#8a6d00]",
  off_track: "text-[#c04800]",
};

export function OkrProgressBar({
  progress,
  pace,
  health,
  unit = "count",
  currentValue,
  targetValue,
  showValues = true,
  compact = false,
}: OkrProgressBarProps) {
  const clampedProgress = Math.min(progress, 100);
  const clampedPace = pace !== undefined ? Math.min(pace, 100) : undefined;
  const exceeded = progress > 100;

  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      {showValues && (currentValue !== undefined || targetValue !== undefined) && (
        <div className="flex items-center justify-between text-xs text-[rgba(31,22,15,0.5)]">
          <span>
            {currentValue !== undefined && (
              <span className="font-semibold text-[rgba(31,22,15,0.8)]">
                {currentValue.toLocaleString()}
              </span>
            )}
            {unit && unit !== "count" && ` ${unit}`}
          </span>
          <span className="flex items-center gap-1.5">
            {exceeded && (
              <span className="text-[#9bb068] font-bold">Exceeded</span>
            )}
            <span className={`font-bold ${TEXT_COLOR[health]}`}>
              {Math.round(progress)}%
            </span>
            {targetValue !== undefined && (
              <span className="text-[rgba(31,22,15,0.4)]">
                / {targetValue.toLocaleString()}
                {unit && unit !== "count" ? ` ${unit}` : ""}
              </span>
            )}
          </span>
        </div>
      )}

      <div
        className={`relative w-full bg-[rgba(31,22,15,0.06)] rounded-full overflow-visible ${
          compact ? "h-1.5" : "h-2"
        }`}
      >
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${BAR_COLOR[health]}`}
          style={{ width: `${clampedProgress}%` }}
        />
        {clampedPace !== undefined && clampedPace > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-full rounded-full bg-[rgba(31,22,15,0.25)]"
            style={{ left: `${clampedPace}%` }}
            title={`Expected pace: ${Math.round(clampedPace)}%`}
          />
        )}
      </div>

      {!compact && clampedPace !== undefined && (
        <div className="flex items-center justify-end gap-1 text-[10px] text-[rgba(31,22,15,0.4)]">
          <span className="inline-block w-2 h-px bg-[rgba(31,22,15,0.25)]" />
          <span>Expected pace: {Math.round(clampedPace)}%</span>
        </div>
      )}
    </div>
  );
}

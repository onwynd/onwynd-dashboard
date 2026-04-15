"use client";

import type { OkrHealth } from "@/types/okr";

interface OkrHealthBadgeProps {
  health: OkrHealth;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const CONFIG: Record<
  OkrHealth,
  { label: string; bg: string; text: string; dot: string }
> = {
  on_track: {
    label: "On Track",
    bg: "bg-[#9bb068]/10",
    text: "text-[#5a7a2e]",
    dot: "bg-[#9bb068]",
  },
  at_risk: {
    label: "At Risk",
    bg: "bg-[#ffce5c]/15",
    text: "text-[#8a6d00]",
    dot: "bg-[#d4a800]",
  },
  off_track: {
    label: "Off Track",
    bg: "bg-[#fe814b]/10",
    text: "text-[#c04800]",
    dot: "bg-[#fe814b]",
  },
};

export function OkrHealthBadge({
  health,
  size = "md",
  showLabel = true,
}: OkrHealthBadgeProps) {
  const c = CONFIG[health];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${c.bg} ${c.text} ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span
        className={`shrink-0 rounded-full ${c.dot} ${
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
        }`}
      />
      {showLabel && c.label}
    </span>
  );
}

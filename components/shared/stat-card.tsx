"use client";

import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatColour = "teal" | "amber" | "blue" | "red" | "emerald" | "purple" | "navy";

const COLOUR_MAP: Record<StatColour, { icon: string; value: string }> = {
  teal:    { icon: "bg-teal/10",         value: "text-teal"         },
  amber:   { icon: "bg-amber-warm/10",   value: "text-amber-warm"   },
  blue:    { icon: "bg-blue-50",         value: "text-blue-600"     },
  red:     { icon: "bg-red-50",          value: "text-red-500"      },
  emerald: { icon: "bg-emerald-50",      value: "text-emerald-600"  },
  purple:  { icon: "bg-purple-50",       value: "text-purple-600"   },
  navy:    { icon: "bg-[#0A1628]/10",    value: "text-navy"         },
};

export interface StatCardProps {
  label: string;
  value: string | number | null | undefined;
  icon: LucideIcon;
  colour?: StatColour;
  /** % change vs last period — positive=up, negative=down, undefined=hide */
  trend?: number;
  trendLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  colour = "teal",
  trend,
  trendLabel = "vs last month",
  isLoading = false,
  className,
}: StatCardProps) {
  const colours = COLOUR_MAP[colour];

  if (isLoading) {
    return (
      <div className={cn("bg-white rounded-xl border border-gray-100 shadow-sm p-5 card-hover-lift", className)}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-16 rounded skeleton-shimmer" />
        </div>
        <div className="h-7 w-24 rounded skeleton-shimmer mb-2" />
        <div className="h-3 w-32 rounded skeleton-shimmer" />
      </div>
    );
  }

  const displayValue = value !== null && value !== undefined ? String(value) : "—";

  return (
    <div className={cn("bg-white rounded-xl border border-gray-100 shadow-sm p-5 card-hover-lift", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colours.icon)}>
          <Icon className={cn("w-5 h-5", colours.value)} />
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend >= 0 ? "text-emerald-600" : "text-red-500"
            )}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-gray-900 leading-tight mb-1">{displayValue}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {trend !== undefined && (
        <p className="text-xs text-gray-400 mt-1">{trendLabel}</p>
      )}
    </div>
  );
}

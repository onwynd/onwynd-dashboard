"use client";

import {
  Coins,
  Package,
  Users,
  MessageCircle,
  TrendingUp,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { useAdminStore } from "@/store/admin-store";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsShimmer } from "@/components/shared/shimmer-skeleton";

type StatColour = "teal" | "amber" | "blue" | "red" | "emerald" | "purple" | "navy";

const ICON_MAP: Record<string, LucideIcon> = {
  coins:    Coins,
  box:      Package,
  users:    Users,
  messages: MessageCircle,
  trending: TrendingUp,
  activity: Activity,
};

const COLOUR_MAP: Record<string, StatColour> = {
  coins:    "amber",
  box:      "blue",
  users:    "teal",
  messages: "blue",
  trending: "emerald",
  activity: "blue",
};

export function StatsCards() {
  const stats = useAdminStore((state) => state.stats);

  if (!stats) {
    // Show shimmer while loading (null = loading, [] = empty)
    return <StatCardsShimmer count={4} />;
  }

  if (stats.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
        No statistics available — refresh to reload.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const iconKey = stat.icon ?? stat.iconName ?? "";
        const Icon = ICON_MAP[iconKey] ?? Coins;
        const colour = COLOUR_MAP[iconKey] ?? "teal";

        // Parse trend from stat.change string (e.g. "↑ 12%" or "12%")
        let trend: number | undefined;
        if (stat.change) {
          const match = stat.change.match(/([-+]?\d+(?:\.\d+)?)/);
          if (match) {
            const val = parseFloat(match[1]);
            trend = stat.isPositive ? Math.abs(val) : -Math.abs(val);
          }
        }

        return (
          <StatCard
            key={stat.id}
            label={stat.title}
            value={stat.value}
            icon={Icon}
            colour={colour}
            trend={trend}
            trendLabel={stat.changeValue}
          />
        );
      })}
    </div>
  );
}

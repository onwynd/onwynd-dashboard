"use client";

import { useAmbassadorStore } from "@/store/ambassador-store";
import { useEffect } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

const iconMap = {
  Users: Users,
  DollarSign: DollarSign,
  TrendingUp: TrendingUp,
  Award: Award,
};

const trendMap = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: Minus,
};

const trendColorMap = {
  up: "text-emerald-500",
  down: "text-rose-500",
  neutral: "text-muted-foreground",
};

export function StatsCards() {
  const stats = useAmbassadorStore((state) => state.stats);
  const fetchStats = useAmbassadorStore((state) => state.fetchStats);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat) => {
        const Icon = iconMap[stat.iconName];
        const TrendIcon = trendMap[stat.trend];
        const trendColor = trendColorMap[stat.trend];

        return (
          <div
            key={stat.title}
            className="relative p-5 rounded-xl border bg-card overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-black/5 to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <div className="p-2 bg-background/50 rounded-lg">
                <Icon className="size-5 text-foreground/70" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-semibold tracking-tight">
                {stat.value}
              </h3>
              <div className={`flex items-center text-xs font-medium ${trendColor}`}>
                <TrendIcon className="size-3 mr-1" />
                {stat.change}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

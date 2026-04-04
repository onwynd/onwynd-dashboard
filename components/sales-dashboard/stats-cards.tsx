"use client";

import { DollarSign, Briefcase, TrendingUp, Percent } from "lucide-react";
import { useSalesStore } from "@/store/sales-store";

export function StatsCards() {
  const stats = useSalesStore((state) => state.stats);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "dollar-sign":
        return DollarSign;
      case "briefcase":
        return Briefcase;
      case "trending-up":
        return TrendingUp;
      case "percent":
        return Percent;
      default:
        return DollarSign;
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 rounded-xl border bg-card">
      {stats.map((stat, index) => {
        const Icon = getIcon(stat.icon);
        return (
          <div key={stat.id} className="flex items-start">
            <div className="flex-1 space-y-2 sm:space-y-4 lg:space-y-6">
              <div className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground">
                <Icon className="size-3.5 sm:size-[18px]" />
                <span className="text-[10px] sm:text-xs lg:text-sm font-medium truncate">
                  {stat.title}
                </span>
              </div>
              <p className="text-lg sm:text-xl lg:text-[28px] font-semibold leading-tight tracking-tight">
                {stat.value}
              </p>
            </div>
            <div
              className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium ${
                stat.isPositive ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              <span>{stat.change}</span>
            </div>
            {index < stats.length - 1 && (
              <div className="hidden lg:block w-px h-full bg-border mx-4 xl:mx-6 absolute right-0 top-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

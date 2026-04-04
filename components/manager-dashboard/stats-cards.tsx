"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Calendar,
  File,
  Info,
  Activity,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { useManagerStore } from "@/store/manager-store";

export function StatsCards() {
  const stats = useManagerStore((state) => state.stats);
  const fetchStats = useManagerStore((state) => state.fetchStats);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getIcon = (iconName: string) => {
    const name = iconName.toLowerCase();
    switch (name) {
      case "users":
        return Users;
      case "filetext":
      case "file-text":
        return FileText;
      case "calendar":
        return Calendar;
      case "file":
        return File;
      case "info":
        return Info;
      case "activity":
        return Activity;
      case "briefcase":
        return Briefcase;
      default:
        return Users;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return TrendingUp;
      case "down":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-emerald-500";
      case "down":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => {
        const Icon = getIcon(stat.iconName);
        const TrendIcon = getTrendIcon(stat.trend);
        const trendColor = getTrendColor(stat.trend);
        
        return (
          <div
            key={index}
            className="relative p-5 rounded-xl border bg-card overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-black/5 to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between">
              <div className="flex flex-col gap-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-2xl sm:text-[26px] font-semibold tracking-tight">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <TrendIcon className={`size-4 ${trendColor}`} />
                    <span className={`text-sm font-medium ${trendColor}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      vs last month
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="icon" className="size-10 shrink-0">
                <Icon className="size-5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

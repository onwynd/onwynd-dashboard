"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
} from "lucide-react";
import { useComplianceStore } from "@/store/compliance-store";

export function StatsCards() {
  const stats = useComplianceStore((state) => state.stats);
  const fetchStats = useComplianceStore((state) => state.fetchStats);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "shield":
        return Shield;
      case "alert-triangle":
        return AlertTriangle;
      case "check-circle":
        return CheckCircle;
      case "file-text":
        return FileText;
      case "calendar":
        return Calendar;
      default:
        return Shield;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {stats.map((stat) => {
        const Icon = getIcon(stat.icon);
        const SubtitleIcon = getIcon(stat.subtitleIcon);
        
        return (
          <div
            key={stat.id}
            className="relative p-5 rounded-xl border bg-card overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-black/5 to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between">
              <div className="flex flex-col gap-6">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-[26px] font-semibold tracking-tight">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <SubtitleIcon className="size-4" />
                  <span className="text-sm font-medium">{stat.subtitle}</span>
                </div>
              </div>
              <Button variant="outline" size="icon" className="size-10">
                <Icon className="size-5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

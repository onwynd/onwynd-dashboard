"use client";

import { Calendar, Users, Clock, UserPlus } from "lucide-react";
import { useSecretaryStore } from "@/store/secretary-store";

export function SecretaryStatsCards() {
  const stats = useSecretaryStore((state) => state.stats);

  if (!stats) return null;

  const items = [
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      change: "+2 from yesterday",
      isPositive: true
    },
    {
      title: "Active Visitors",
      value: stats.activeVisitors,
      icon: Users,
      change: "Currently on-site",
      isPositive: true
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: Clock,
      change: "Requires attention",
      isPositive: false
    },
    {
      title: "Doctors Available",
      value: stats.doctorsAvailable,
      icon: UserPlus,
      change: "Currently available",
      isPositive: true
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 rounded-xl border bg-card">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="flex items-start">
            <div className="flex-1 space-y-2 sm:space-y-4 lg:space-y-6">
              <div className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground">
                <Icon className="size-3.5 sm:size-[18px]" />
                <span className="text-[10px] sm:text-xs lg:text-sm font-medium truncate">{item.title}</span>
              </div>
              <p className="text-lg sm:text-xl lg:text-[28px] font-semibold leading-tight tracking-tight">
                {item.value}
              </p>
            </div>
            <div
              className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium ${
                item.isPositive ? "text-emerald-500" : "text-amber-500"
              }`}
            >
              <span>{item.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

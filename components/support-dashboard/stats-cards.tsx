"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupportStore } from "@/store/support-store";
import { cn } from "@/lib/utils";
import { Ticket, Inbox, CheckCircle, Clock, Activity } from "lucide-react";
import { useEffect } from "react";

type IconKey = "ticket" | "inbox" | "check-circle" | "clock" | "activity";
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
const iconMap: Record<IconKey, IconComponent> = {
  ticket: Ticket,
  inbox: Inbox,
  "check-circle": CheckCircle,
  clock: Clock,
  activity: Activity,
};

export function StatsCards() {
  const stats = useSupportStore((state) => state.stats);
  const fetchStats = useSupportStore((state) => state.fetchStats);
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const key = (stat.icon?.toLowerCase?.() as IconKey) || "activity";
        const Icon = iconMap[key] || Activity;
        return (
          <Card key={stat.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span
                  className={cn(
                    "font-medium",
                    stat.trend === "up"
                      ? "text-emerald-500"
                      : stat.trend === "down"
                      ? "text-rose-500"
                      : "text-muted-foreground"
                  )}
                >
                  {stat.change}
                </span>{" "}
                from yesterday
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

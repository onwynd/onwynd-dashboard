"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketingStore } from "@/store/marketing-store";
import { cn } from "@/lib/utils";
import { Share2, Users, TrendingUp, MousePointer, Activity } from "lucide-react";

type IconKey = "share2" | "users" | "trendingup" | "mousepointer" | "activity";
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
const iconMap: Record<IconKey, IconComponent> = {
  share2: Share2,
  users: Users,
  trendingup: TrendingUp,
  mousepointer: MousePointer,
  activity: Activity,
};

export function StatsCards() {
  const stats = useMarketingStore((state) => state.stats);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const key = (stat.iconName?.toLowerCase?.() as IconKey) || "activity";
        const Icon = iconMap[key] || Activity;
        return (
          <Card key={stat.title}>
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
                    stat.changeType === "increase"
                      ? "text-emerald-500"
                      : stat.changeType === "decrease"
                      ? "text-rose-500"
                      : "text-muted-foreground"
                  )}
                >
                  {stat.change}
                </span>{" "}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

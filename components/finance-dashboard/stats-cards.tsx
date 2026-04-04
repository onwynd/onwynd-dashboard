"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/store/finance-store";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { DollarSign, TrendingUp, CreditCard, Activity } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
  "credit-card": CreditCard,
  "activity": Activity,
};

export function StatsCards() {
  const stats = useFinanceStore((state) => state.stats);
  const fetchStats = useFinanceStore((state) => state.fetchStats);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.iconName] || DollarSign;
        
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

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductStore } from "@/store/product-store";
import { cn } from "@/lib/utils";
import { Package, TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart, Activity } from "lucide-react";

type IconKey = "package" | "trending-up" | "dollar-sign" | "shopping-cart" | "activity";
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
const iconMap: Record<IconKey, IconComponent> = {
  package: Package,
  "trending-up": TrendingUp,
  "dollar-sign": DollarSign,
  "shopping-cart": ShoppingCart,
  activity: Activity,
};

export function StatsCards() {
  const stats = useProductStore((state) => state.stats);

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
                    stat.trend === "up"
                      ? "text-emerald-500"
                      : stat.trend === "down"
                      ? "text-rose-500"
                      : "text-muted-foreground"
                  )}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                  ) : stat.trend === "down" ? (
                    <TrendingDown className="inline h-3 w-3 mr-1" />
                  ) : (
                    <Minus className="inline h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

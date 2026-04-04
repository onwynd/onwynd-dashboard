"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useAmbassadorStore } from "@/store/ambassador-store";
import { useEffect } from "react";

export function ReferralChart() {
  const chartData = useAmbassadorStore((state) => state.chartData);
  const fetchChartData = useAmbassadorStore((state) => state.fetchChartData);

  useEffect(() => {
    fetchChartData("6months");
  }, [fetchChartData]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Referrals vs Earnings over time</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="size-4" />
          Export Data
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Referrals
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].value}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Earnings
                            </span>
                            <span className="font-bold text-muted-foreground">
                              ${payload[1].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="earnings"
                strokeWidth={2}
                activeDot={{
                  r: 6,
                  style: { fill: "var(--theme-primary)", opacity: 0.8 },
                }}
                className="stroke-primary"
              />
              <Line
                type="monotone"
                dataKey="referrals"
                strokeWidth={2}
                strokeDasharray="5 5"
                className="stroke-muted-foreground"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

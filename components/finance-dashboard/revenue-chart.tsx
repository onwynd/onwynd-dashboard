"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFinanceStore } from "@/store/finance-store";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export function RevenueChart() {
  const data = useFinanceStore((state) => state.revenueData);
  const fetchRevenueData = useFinanceStore((state) => state.fetchRevenueData);

  useEffect(() => {
    fetchRevenueData("6months");
  }, []); // Empty dependency array - fetchRevenueData is a stable Zustand action

  if (!data || data.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
          <CardDescription>
            Financial performance over the last 7 months
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <AlertTriangle className="size-8 text-muted-foreground mx-auto" />
              <div className="text-sm text-muted-foreground">No revenue data available</div>
              <div className="text-xs text-muted-foreground">Try refreshing the data</div>
              <Button variant="outline" size="sm" onClick={() => fetchRevenueData("6months")}>
                <RefreshCw className="size-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue vs Expenses</CardTitle>
        <CardDescription>
          Financial performance over the last 7 months
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{ borderRadius: "8px" }}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-rose-500"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

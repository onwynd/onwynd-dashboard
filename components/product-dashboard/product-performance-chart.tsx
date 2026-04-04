"use client";

import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useProductStore } from "@/store/product-store";
import { useEffect } from "react";

export function ProductPerformanceChart() {
  const { resolvedTheme } = useTheme();
  const chartData = useProductStore((state) => state.chartData);
  const fetchChartData = useProductStore((state) => state.fetchChartData);
  
  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#71717a" : "#a1a1aa";
  const gridColor = isDark ? "#27272a" : "#f4f4f5";

  useEffect(() => {
    fetchChartData("month");
  }, [fetchChartData]);

  return (
    <div className="flex-1 min-w-[300px] p-6 rounded-xl border bg-card">
      <h3 className="text-lg font-semibold mb-6">Sales Performance</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ fill: isDark ? "#27272a" : "#f4f4f5" }}
              contentStyle={{
                backgroundColor: isDark ? "#18181b" : "#ffffff",
                borderColor: isDark ? "#27272a" : "#e4e4e7",
                borderRadius: "0.5rem",
              }}
              itemStyle={{ color: isDark ? "#e4e4e7" : "#09090b" }}
              formatter={(value) => [`$${(value ?? 0) as number}`, "Revenue"]}
            />
            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useMarketingStore } from "@/store/marketing-store";

export function CampaignPerformanceChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { resolvedTheme } = useTheme();
  const chartData = useMarketingStore((state) => state.chartData);
  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#71717a" : "#a1a1aa";
  const gridColor = isDark ? "#27272a" : "#f4f4f5";

  return (
    <div className="flex-1 min-w-[300px] p-6 rounded-xl border bg-card">
      <h3 className="text-lg font-semibold mb-6">Campaign Performance</h3>
      <div className="h-[300px] w-full">
        {!mounted ? <div className="h-full" /> : <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#18181b" : "#ffffff",
                borderColor: isDark ? "#27272a" : "#e4e4e7",
                borderRadius: "0.5rem",
              }}
              itemStyle={{ color: isDark ? "#e4e4e7" : "#09090b" }}
            />
            <Legend />
            <Bar dataKey="facebook" fill="#1877F2" radius={[4, 4, 0, 0]} name="Facebook" />
            <Bar dataKey="google" fill="#DB4437" radius={[4, 4, 0, 0]} name="Google" />
            <Bar dataKey="linkedin" fill="#0A66C2" radius={[4, 4, 0, 0]} name="LinkedIn" />
          </BarChart>
        </ResponsiveContainer>}
      </div>
    </div>
  );
}

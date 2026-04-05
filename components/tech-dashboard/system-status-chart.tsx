"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTechStore } from "@/store/tech-store";

export function SystemStatusChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { resolvedTheme } = useTheme();
  const chartData = useTechStore((state) => state.chartData);
  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#71717a" : "#a1a1aa";
  const gridColor = isDark ? "#27272a" : "#f4f4f5";

  return (
    <div className="flex-1 min-w-[300px] p-6 rounded-xl border bg-card">
      <h3 className="text-lg font-semibold mb-6">System Performance (24h)</h3>
      <div className="h-[300px] w-full">
        {!mounted ? <div className="h-full" /> : <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="time"
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
            <Line
              type="monotone"
              dataKey="requests"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              name="Requests/sec"
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Latency (ms)"
            />
          </LineChart>
        </ResponsiveContainer>}
      </div>
    </div>
  );
}

"use client";

import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTechStore } from "@/store/tech-store";

export function SystemHealthChart() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#71717a" : "#a1a1aa";
  const gridColor = isDark ? "#27272a" : "#f4f4f5";
  
  const data = useTechStore((state) => state.chartData);

  return (
    <div className="flex-1 min-w-[300px] p-6 rounded-xl border bg-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">System Health</h3>
        <div className="flex items-center gap-2">
           <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
             <div className="size-2 rounded-full bg-blue-500" />
             Requests
           </span>
           <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
             <div className="size-2 rounded-full bg-emerald-500" />
             Latency
           </span>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12 }}
              dy={10}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
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
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="requests"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorRequests)"
              name="Requests/sec"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="latency"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorLatency)"
              name="Latency (ms)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

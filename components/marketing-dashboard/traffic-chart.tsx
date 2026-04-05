"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMarketingStore } from "@/store/marketing-store";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export function TrafficChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const data = useMarketingStore((state) => state.chartData);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
        <CardDescription>
          Daily clicks by platform over the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {!mounted ? <div className="h-full" /> : <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorFacebook" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorGoogle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLinkedin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
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
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{ borderRadius: "8px" }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="facebook"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorFacebook)"
              name="Facebook"
            />
            <Area
              type="monotone"
              dataKey="google"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorGoogle)"
              name="Google"
            />
            <Area
              type="monotone"
              dataKey="linkedin"
              stroke="#0ea5e9"
              fillOpacity={1}
              fill="url(#colorLinkedin)"
              name="LinkedIn"
            />
          </AreaChart>
        </ResponsiveContainer>}
      </CardContent>
    </Card>
  );
}

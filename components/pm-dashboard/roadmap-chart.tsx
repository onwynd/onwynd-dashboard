"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePMStore } from "@/store/pm-store";
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
import { useEffect } from "react";

export function RoadmapChart() {
  const data = usePMStore((state) => state.roadmapData);
  const fetchRoadmap = usePMStore((state) => state.fetchRoadmap);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Roadmap Progress</CardTitle>
        <CardDescription>
          Planned vs Completed Features per Quarter
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
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{ borderRadius: "8px" }}
            />
            <Legend />
            <Bar
              dataKey="planned"
              name="Planned"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-emerald-500"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

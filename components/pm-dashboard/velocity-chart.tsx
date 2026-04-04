"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { usePMStore } from "@/store/pm-store";
import { useEffect } from "react";

export function VelocityChart() {
  const velocityData = usePMStore((state) => state.velocityData);
  const fetchVelocity = usePMStore((state) => state.fetchVelocity);

  useEffect(() => {
    fetchVelocity();
  }, [fetchVelocity]);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Sprint Velocity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={velocityData}>
              <XAxis 
                dataKey="sprint" 
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
                tickFormatter={(value) => `${value}`} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
              <Legend />
              <Bar 
                dataKey="committed" 
                name="Committed" 
                fill="hsl(var(--muted-foreground))" 
                radius={[4, 4, 0, 0]} 
                opacity={0.5}
              />
              <Bar 
                dataKey="completed" 
                name="Completed" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

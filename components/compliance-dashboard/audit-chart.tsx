"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ChartLine } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useComplianceStore } from "@/store/compliance-store";

export function AuditChart() {
  const auditData = useComplianceStore((state) => state.auditData);
  const fetchAuditData = useComplianceStore((state) => state.fetchAuditData);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetchAuditData();
  }, [fetchAuditData]);

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-xl border bg-card w-full h-[400px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button variant="outline" size="icon" className="size-7 sm:size-8">
            <ChartLine className="size-4 sm:size-[18px] text-muted-foreground" />
          </Button>
          <span className="text-sm sm:text-base font-medium">Compliance Distribution</span>
        </div>
        <Button variant="ghost" size="icon" className="size-7 sm:size-8">
          <MoreHorizontal className="size-4 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex-1 w-full min-h-0">
        {!mounted ? <div className="h-full" /> : <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={auditData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {auditData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {auditData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-muted-foreground">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

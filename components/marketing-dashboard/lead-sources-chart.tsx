"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  ChartLine,
  MoreHorizontal,
  Download,
  Share2,
  Maximize2,
  RefreshCw,
  Settings2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useMarketingStore } from "@/store/marketing-store";

type TimeRange = "7days" | "30days" | "90days" | "12months";

const timeRangeLabels: Record<TimeRange, string> = {
  "7days": "Last 7 Days",
  "30days": "Last 30 Days",
  "90days": "Last 3 Months",
  "12months": "Last Year",
};

export function LeadSourcesChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [showLabels, setShowLabels] = useState(true);
  const leadSources = useMarketingStore((state) => state.leadSources);
  const fetchLeadSources = useMarketingStore((state) => state.fetchLeadSources);

  useEffect(() => {
    fetchLeadSources(timeRange);
  }, [fetchLeadSources, timeRange]);

  const data = leadSources;
  const totalLeads = data.reduce((acc, item) => acc + item.value, 0);

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-xl border bg-card w-full xl:w-[410px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button variant="outline" size="icon" className="size-7 sm:size-8">
            <ChartLine className="size-4 sm:size-[18px] text-muted-foreground" />
          </Button>
          <span className="text-sm sm:text-base font-medium">Lead Sources</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 sm:size-8">
              <MoreHorizontal className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Time Range</DropdownMenuLabel>
            {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
              <DropdownMenuCheckboxItem
                key={range}
                checked={timeRange === range}
                onCheckedChange={() => setTimeRange(range)}
              >
                {timeRangeLabels[range]}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Display Options</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={showLabels}
              onCheckedChange={setShowLabels}
            >
              Show labels
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Download className="size-4 mr-2" />
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="size-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Maximize2 className="size-4 mr-2" />
              Full Screen
            </DropdownMenuItem>
            <DropdownMenuItem>
              <RefreshCw className="size-4 mr-2" />
              Refresh Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="relative shrink-0 size-[220px]">
          {!mounted ? <div className="h-full" /> : <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="42%"
                outerRadius="70%"
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg sm:text-xl font-semibold">
              {totalLeads.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              Total Leads
            </span>
          </div>
        </div>

        {showLabels && (
          <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-4">
            {data.map((item, index) => (
              <div
                key={item.name}
                className={`flex items-center gap-2 sm:gap-2.5 cursor-pointer transition-opacity ${
                  activeIndex !== null && activeIndex !== index
                    ? "opacity-50"
                    : ""
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div
                  className="w-1 h-4 sm:h-5 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 text-xs sm:text-sm text-muted-foreground truncate">
                  {item.name}
                </span>
                <span className="text-xs sm:text-sm font-semibold tabular-nums">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Settings2 className="size-3" />
        <span>{timeRangeLabels[timeRange]}</span>
      </div>
    </div>
  );
}

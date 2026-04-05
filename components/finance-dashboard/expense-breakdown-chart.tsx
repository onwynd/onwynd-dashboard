"use client";

import { useEffect, useState } from "react";
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
  PieChart as PieChartIcon,
  MoreHorizontal,
  Download,
  Share2,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useFinanceStore } from "@/store/finance-store";

const timeRangeLabels = {
  "7days": "Last 7 Days",
  "30days": "Last 30 Days",
  "90days": "Last 90 Days",
};

type TimeRange = keyof typeof timeRangeLabels;

export function ExpenseBreakdownChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");
  const [activeIndex, setActiveIndex] = useState<number | undefined>(0);
  const [showLabels, setShowLabels] = useState(true);
  const expenseBreakdown = useFinanceStore((state) => state.expenseBreakdown);
  const fetchExpenseBreakdown = useFinanceStore((state) => state.fetchExpenseBreakdown);
  const data = expenseBreakdown[timeRange] || [];
  
  const totalExpenses = data.reduce((acc, item) => acc + item.value, 0);

  // Hover highlighting retained via legend items; pie renders statically

  useEffect(() => {
    fetchExpenseBreakdown(timeRange);
  }, [fetchExpenseBreakdown, timeRange]);

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-xl border bg-card w-full h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button variant="outline" size="icon" className="size-7 sm:size-8">
            <PieChartIcon className="size-4 sm:size-[18px] text-muted-foreground" />
          </Button>
          <span className="text-sm sm:text-base font-medium">Expense Breakdown</span>
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

      <div className="flex flex-col items-center gap-4 sm:gap-6 flex-1 min-h-[300px]">
        <div className="relative w-full h-[250px]">
          {!mounted ? <div className="h-full" /> : <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold">
              ${(totalExpenses / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-muted-foreground">Total Expenses</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full max-w-[300px]">
          {data.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between text-sm transition-opacity duration-200 ${
                activeIndex !== undefined && activeIndex !== index
                  ? "opacity-40"
                  : "opacity-100"
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  ${(item.value / 1000).toFixed(1)}k
                </span>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {((item.value / totalExpenses) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

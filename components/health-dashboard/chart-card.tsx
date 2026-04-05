"use client";

import { useState, useEffect } from "react";
import { Users, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useHealthStore, type ChartDataPoint } from "@/store/health-store";

const VISITS_COLOR_LIGHT = "#10b981";
const VISITS_COLOR_DARK  = "#34d399";

interface ChartCardProps {
  /** Override the card title. Defaults to "Patient Visits". */
  title?: string;
  /** Override the data series. Falls back to store chartData. */
  data?: ChartDataPoint[];
  /** Override the bar colour (hex). Falls back to emerald. */
  barColor?: string;
}

export function ChartCard({ title = "Patient Visits", data, barColor }: ChartCardProps) {
  const { chartData } = useHealthStore();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const isDark         = resolvedTheme === "dark";
  const defaultColor   = isDark ? VISITS_COLOR_DARK : VISITS_COLOR_LIGHT;
  const visitsColor    = barColor ?? defaultColor;
  const displayData    = data ?? chartData;

  const formatDateRange = (d: Date | undefined) => {
    if (!d) return "This Week";
    return d.toLocaleDateString("en-US", { month: "long" });
  };

  return (
    <div className="relative rounded-xl border border-border bg-card p-6 max-h-[400px] overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <h2 className="text-[15px] font-normal text-foreground tracking-[-0.45px]">
            {title}
          </h2>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-2 text-xs px-[10px] py-[4px]"
            >
              <CalendarIcon className="size-4" />
              {formatDateRange(date)}
              <ChevronDown className="size-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="mb-4 flex items-center justify-center gap-[22px]">
        <div className="flex items-center gap-1.5">
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: visitsColor }}
          />
          <span className="text-xs font-medium text-muted-foreground tracking-[-0.24px]">
            Check-ins
          </span>
        </div>
      </div>

      <div className="h-[250px] w-full">
        {!mounted ? <div className="h-full" /> : <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} barGap={8}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke={isDark ? "#2A2A2A" : "#E8E9ED"}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? "#B4B4B4" : "#95979d", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? "#B4B4B4" : "#95979d", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                borderColor:     isDark ? "#374151" : "#e5e7eb",
                borderRadius:    "8px",
              }}
              cursor={{ fill: "transparent" }}
            />
            <Bar
              dataKey="value"
              fill={visitsColor}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>}
      </div>
    </div>
  );
}

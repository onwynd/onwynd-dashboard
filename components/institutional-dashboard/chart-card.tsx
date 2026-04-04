"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, TrendingUp } from "lucide-react";
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
import { useInstitutionalStore } from "@/store/institutional-store";

// Couleurs exactes du design Figma
const ACTIVE_COLOR_LIGHT = "#252C2C";
const ACTIVE_COLOR_DARK = "#E8E9ED"; // Gris clair pour dark mode
const PENDING_COLOR = "#888DF9";

// Couleurs pour les labels selon le thème
const LABEL_COLOR_LIGHT = "#95979d";
const LABEL_COLOR_DARK = "#B4B4B4"; // Gris clair pour dark mode

// Couleurs pour la grille selon le thème
const GRID_COLOR_LIGHT = "#E8E9ED";
const GRID_COLOR_DARK = "#2A2A2A";

export function ChartCard() {
  const { chartData } = useInstitutionalStore();
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Utiliser resolvedTheme pour gérer le thème système
  // resolvedTheme sera undefined jusqu'au montage, donc on utilise light par défaut
  const isDark = resolvedTheme === "dark";
  const activeColor = isDark ? ACTIVE_COLOR_DARK : ACTIVE_COLOR_LIGHT;
  const labelColor = isDark ? LABEL_COLOR_DARK : LABEL_COLOR_LIGHT;
  const gridColor = isDark ? GRID_COLOR_DARK : GRID_COLOR_LIGHT;

  const formatDateRange = (date: Date | undefined) => {
    if (!date) return "November";
    const month = date.toLocaleDateString("en-US", { month: "long" });
    return month;
  };

  return (
    <div className="relative rounded-xl border border-border bg-card p-6 max-h-[400px] overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-muted-foreground" />
          <h2 className="text-[15px] font-normal text-foreground tracking-[-0.45px]">
            Referrals Trend
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
            style={{ backgroundColor: activeColor }}
          />
          <span className="text-xs font-medium text-muted-foreground tracking-[-0.24px]">
            Active
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: PENDING_COLOR }}
          />
          <span className="text-xs font-medium text-muted-foreground tracking-[-0.24px]">
            Pending
          </span>
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
            barSize={30}
          >
            <CartesianGrid
              vertical={false}
              stroke={gridColor}
              strokeDasharray="0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: labelColor, fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: labelColor, fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
                borderRadius: "8px",
                border: "none",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar
              dataKey="active"
              stackId="a"
              fill={activeColor}
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="pending"
              stackId="a"
              fill={PENDING_COLOR}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

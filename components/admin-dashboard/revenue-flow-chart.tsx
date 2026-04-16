"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import {
  BarChart2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  LineChartIcon,
  TrendingUp,
  Calendar,
  Grid3X3,
  RefreshCw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminStore } from "@/store/admin-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyChartState } from "./empty-state";

type ChartType = "bar" | "line" | "area";
type TimePeriod = "3months" | "6months" | "year" | "q1" | "q2" | "q3" | "q4";
type RevenuePoint = { name: string; value: number };

const periodLabels: Record<TimePeriod, string> = {
  "3months": "Last 3 Months",
  "6months": "Last 6 Months",
  year: "Full Year",
  q1: "Q1 (Jan-Mar)",
  q2: "Q2 (Apr-Jun)",
  q3: "Q3 (Jul-Sep)",
  q4: "Q4 (Oct-Dec)",
};

function buildInsights(data: RevenuePoint[], periodLabel: string): string[] {
  if (!data || data.length === 0) return ["No revenue data available for this period."];
  const total = data.reduce((s, d) => s + d.value, 0);
  const best = data.reduce((a, b) => (b.value > a.value ? b : a));
  const worst = data.reduce((a, b) => (b.value < a.value ? b : a));
  const avg = Math.round(total / data.length);
  return [
    `${best.name} is the top-performing month with $${best.value.toLocaleString()}.`,
    `Total revenue for ${periodLabel}: $${total.toLocaleString()}.`,
    `Average monthly revenue: $${avg.toLocaleString()}.`,
    worst.value < avg
      ? `${worst.name} was the weakest month at $${worst.value.toLocaleString()}.`
      : `Revenue is consistently above average across all months.`,
  ];
}

function CustomTooltip(props: unknown) {
  const { active, payload } = props as TooltipProps<number, string> & { payload?: Array<{ value?: number }> };
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            Value
          </span>
          <span className="font-bold text-muted-foreground">
            ${payload[0]?.value?.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function RevenueFlowChart() {
  const { resolvedTheme } = useTheme();

  const [chartType, setChartType] = useState<ChartType>("bar");
  const [period, setPeriod] = useState<TimePeriod>("6months");
  const [showGrid, setShowGrid] = useState(true);
  const [showThisYear, setShowThisYear] = useState(true);
  const [showPrevYear, setShowPrevYear] = useState(true);
  const [smoothCurve, setSmoothCurve] = useState(true);
  const [currentInsight, setCurrentInsight] = useState(0);

  // Reset insight index when period changes
  useEffect(() => { setCurrentInsight(0); }, [period]);

  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#71717a" : "#a1a1aa";
  const gridColor = isDark ? "#27272a" : "#f4f4f5";

  const isMounted = useIsMounted();
  const revenueFlow = useAdminStore((state) => state.revenueFlow);
  const fullYearData = revenueFlow;

  function getDataForPeriod(period: TimePeriod) {
    switch (period) {
      case "3months":
        return fullYearData.slice(-3);
      case "6months":
        return fullYearData.slice(0, 6);
      case "q1":
        return fullYearData.slice(0, 3);
      case "q2":
        return fullYearData.slice(3, 6);
      case "q3":
        return fullYearData.slice(6, 9);
      case "q4":
        return fullYearData.slice(9, 12);
      default:
        return fullYearData;
    }
  }

  const chartData: RevenuePoint[] = getDataForPeriod(period).map((entry) => ({
    name: (entry as any).name ?? (entry as any).month ?? "",
    value: (entry as any).value ?? (entry as any).revenue ?? 0,
  }));
  
  // Check for empty data
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex-1 flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl border bg-card min-w-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-1">
            <Button variant="outline" size="icon" className="size-7 sm:size-8">
              <BarChart2 className="size-4 sm:size-[18px] text-muted-foreground" />
            </Button>
            <span className="text-sm sm:text-base font-medium">Revenue Flow</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 sm:size-3 rounded-full bg-[#6e3ff3]" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">This Year</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 sm:size-3 rounded-full bg-[#e255f2]" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Prev Year</span>
            </div>
          </div>
        </div>
        <EmptyChartState
          title="No revenue data available"
          description="Revenue flow data could not be loaded. Please try refreshing the data."
          onRefresh={() => window.location.reload()}
        />
      </div>
    );
  }
  
  const totalRevenue = chartData.reduce((acc, item) => acc + item.value, 0);
  const insights = buildInsights(chartData, periodLabels[period]);

  return (
    <div className="flex-1 flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl border bg-card min-w-0">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1">
          <Button variant="outline" size="icon" className="size-7 sm:size-8">
            <BarChart2 className="size-4 sm:size-[18px] text-muted-foreground" />
          </Button>
          <span className="text-sm sm:text-base font-medium">Revenue Flow</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 sm:size-3 rounded-full bg-[#6e3ff3]" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">This Year</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 sm:size-3 rounded-full bg-[#e255f2]" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Prev Year</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 sm:size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Chart Options</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <BarChart3 className="size-4 mr-2" />
                Chart Type
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setChartType("bar")}>
                  <BarChart3 className="size-4 mr-2" />
                  Bar Chart
                  {chartType === "bar" && <Check className="size-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("line")}>
                  <LineChartIcon className="size-4 mr-2" />
                  Line Chart
                  {chartType === "line" && <Check className="size-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("area")}>
                  <TrendingUp className="size-4 mr-2" />
                  Area Chart
                  {chartType === "area" && <Check className="size-4 ml-auto" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Calendar className="size-4 mr-2" />
                Time Period
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {(Object.keys(periodLabels) as TimePeriod[]).map((key) => (
                  <DropdownMenuItem key={key} onClick={() => setPeriod(key)}>
                    {periodLabels[key]}
                    {period === key && <Check className="size-4 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuCheckboxItem
              checked={showGrid}
              onCheckedChange={setShowGrid}
            >
              <Grid3X3 className="size-4 mr-2" />
              Show Grid Lines
            </DropdownMenuCheckboxItem>

            {(chartType === "line" || chartType === "area") && (
              <DropdownMenuCheckboxItem
                checked={smoothCurve}
                onCheckedChange={setSmoothCurve}
              >
                <TrendingUp className="size-4 mr-2" />
                Smooth Curve
              </DropdownMenuCheckboxItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">Data Series</DropdownMenuLabel>

            <DropdownMenuCheckboxItem
              checked={showThisYear}
              onCheckedChange={setShowThisYear}
            >
              <div
                className="size-3 rounded-full mr-2"
                style={{ background: "#6e3ff3" }}
              />
              Show This Year
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={showPrevYear}
              onCheckedChange={setShowPrevYear}
            >
              <div
                className="size-3 rounded-full mr-2"
                style={{ background: "#e255f2" }}
              />
              Show Prev Year
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                setChartType("bar");
                setPeriod("6months");
                setShowGrid(true);
                setShowThisYear(true);
                setShowPrevYear(true);
                setSmoothCurve(true);
              }}
            >
              <RefreshCw className="size-4 mr-2" />
              Reset to Default
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-10 flex-1 min-h-0">
        <div className="flex flex-col gap-4 w-full lg:w-[200px] xl:w-[220px] shrink-0">
          <div className="space-y-2 sm:space-y-4">
            <p className="text-xl sm:text-2xl lg:text-[28px] font-semibold leading-tight tracking-tight">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Total Revenue ({periodLabels[period]})
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm font-semibold">🏆 Best Performing Month</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
              {insights[currentInsight]}
            </p>
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <ChevronLeft
                className="size-3 sm:size-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() =>
                  setCurrentInsight((prev) =>
                    prev === 0 ? insights.length - 1 : prev - 1
                  )
                }
              />
              <div className="flex-1 flex items-center gap-1">
                {insights.map((insight, index) => (
                  <div
                    key={insight}
                    className={`flex-1 h-0.5 rounded-full transition-colors ${
                      index === currentInsight
                        ? "bg-foreground"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <ChevronRight
                className="size-3 sm:size-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() =>
                  setCurrentInsight((prev) =>
                    prev === insights.length - 1 ? 0 : prev + 1
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="flex-1 w-full h-[180px] sm:h-[200px] lg:h-[240px] min-w-0">
          {!isMounted ? (
            <Skeleton className="w-full h-full rounded-lg" />
          ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              {chartType === "bar" ? (
                <BarChart data={chartData} barGap={2}>
                  <defs>
                    <linearGradient id="thisYearGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6e3ff3" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6e3ff3" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  {showGrid && (
                    <CartesianGrid
                      strokeDasharray="0"
                      stroke={gridColor}
                      vertical={false}
                    />
                  )}
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisColor, fontSize: 10 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisColor, fontSize: 10 }}
                    dx={-5}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    width={40}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: isDark ? "#27272a" : "#f4f4f5", radius: 4 }}
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#thisYearGradient)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={chartData}>
                  {showGrid && (
                    <CartesianGrid
                      strokeDasharray="0"
                      stroke={gridColor}
                      vertical={false}
                    />
                  )}
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisColor, fontSize: 10 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisColor, fontSize: 10 }}
                    dx={-5}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    width={40}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: isDark ? "#52525b" : "#d4d4d8" }}
                  />
                  <Line
                    type={smoothCurve ? "monotone" : "linear"}
                    dataKey="value"
                    stroke="#6e3ff3"
                    strokeWidth={2}
                    dot={{ fill: "#6e3ff3", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: "#6e3ff3" }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="thisYearAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6e3ff3" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6e3ff3" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  {showGrid && (
                    <CartesianGrid
                      strokeDasharray="0"
                      stroke={gridColor}
                      vertical={false}
                    />
                  )}
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisColor, fontSize: 10 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisColor, fontSize: 10 }}
                    dx={-5}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    width={40}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: isDark ? "#52525b" : "#d4d4d8" }}
                  />
                  <Area
                    type={smoothCurve ? "monotone" : "linear"}
                    dataKey="value"
                    stroke="#6e3ff3"
                    strokeWidth={2}
                    fill="url(#thisYearAreaGradient)"
                  />
                </AreaChart>
              )}
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

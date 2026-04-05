"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Calendar,
  Grid3X3,
  RefreshCw,
  Check,
  AlertTriangle,
} from "lucide-react";
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
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePartnerStore } from "@/store/partner-store";

type ChartType = "bar" | "line" | "area";
type TimePeriod = "3months" | "6months" | "year" | "q1" | "q2" | "q3" | "q4";

const periodLabels: Record<TimePeriod, string> = {
  "3months": "Last 3 Months",
  "6months": "Last 6 Months",
  year: "Full Year",
  q1: "Q1 (Jan-Mar)",
  q2: "Q2 (Apr-Jun)",
  q3: "Q3 (Jul-Sep)",
  q4: "Q4 (Oct-Dec)",
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value?: number;
    dataKey?: string;
    payload?: unknown;
  }>;
  label?: string;
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const moneyInData = payload.find((p) => p.dataKey === "moneyIn");
  const moneyOutData = payload.find((p) => p.dataKey === "moneyOut");
  const moneyIn = moneyInData?.value || 0;
  const moneyOut = moneyOutData?.value || 0;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg ring-1 ring-black/5">
      <div className="mb-2 border-b pb-2">
        <p className="font-medium">{label}</p>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm text-muted-foreground">Money In:</span>
          <span className="ml-auto font-medium tabular-nums">
            ${moneyIn.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-sm text-muted-foreground">Money Out:</span>
          <span className="ml-auto font-medium tabular-nums">
            ${moneyOut.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function FinancialFlowChart() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("year");

  const financialFlow = usePartnerStore((state) => state.financialFlow);
  const fetchFinancialFlow = usePartnerStore((state) => state.fetchFinancialFlow);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetchFinancialFlow(selectedPeriod);
  }, [selectedPeriod]); // fetchFinancialFlow is a stable Zustand action, no need to include it

  // Use financialFlow from store
  const data = financialFlow;

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs">
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b">
          <div>
            <h3 className="font-semibold leading-none tracking-tight">
              Financial Flow
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of incoming and outgoing funds
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchFinancialFlow(selectedPeriod)}>
            <RefreshCw className="size-4 mr-2" />
            Retry
          </Button>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center space-y-2">
            <AlertTriangle className="size-8 text-muted-foreground mx-auto" />
            <div className="text-sm text-muted-foreground">No financial data available</div>
            <div className="text-xs text-muted-foreground">Try refreshing or select a different time period</div>
          </div>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    const commonAxisProps = {
      fontSize: 12,
      tickLine: false,
      axisLine: false,
      stroke: theme === "dark" ? "#525252" : "#a3a3a3",
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={theme === "dark" ? "#262626" : "#e5e5e5"}
            />
            <XAxis {...commonAxisProps} dataKey="month" dy={10} />
            <YAxis
              {...commonAxisProps}
              tickFormatter={(value) => `$${value / 1000}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Line
              type="monotone"
              dataKey="moneyIn"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="moneyOut"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorMoneyIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMoneyOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={theme === "dark" ? "#262626" : "#e5e5e5"}
            />
            <XAxis {...commonAxisProps} dataKey="month" dy={10} />
            <YAxis
              {...commonAxisProps}
              tickFormatter={(value) => `$${value / 1000}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area
              type="monotone"
              dataKey="moneyIn"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorMoneyIn)"
            />
            <Area
              type="monotone"
              dataKey="moneyOut"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorMoneyOut)"
            />
          </AreaChart>
        );
      default:
        return (
          <BarChart {...commonProps} barGap={4}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={theme === "dark" ? "#262626" : "#e5e5e5"}
            />
            <XAxis {...commonAxisProps} dataKey="month" dy={10} />
            <YAxis
              {...commonAxisProps}
              tickFormatter={(value) => `$${value / 1000}k`}
              dx={-10}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: theme === "dark" ? "#262626" : "#f5f5f5" }}
            />
            <Bar
              dataKey="moneyIn"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="moneyOut"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        );
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-xs">
      <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b">
        <div>
          <h3 className="font-semibold leading-none tracking-tight">
            Financial Flow
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of incoming and outgoing funds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <Grid3X3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View: {chartType}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Chart Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={chartType === "bar"}
                onCheckedChange={() => setChartType("bar")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Bar Chart
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={chartType === "line"}
                onCheckedChange={() => setChartType("line")}
              >
                <LineChartIcon className="mr-2 h-4 w-4" />
                Line Chart
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={chartType === "area"}
                onCheckedChange={() => setChartType("area")}
              >
                <AreaChartIcon className="mr-2 h-4 w-4" />
                Area Chart
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {periodLabels[selectedPeriod]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Time Period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Relative</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setSelectedPeriod("3months")}>
                    Last 3 Months
                    {selectedPeriod === "3months" && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedPeriod("6months")}>
                    Last 6 Months
                    {selectedPeriod === "6months" && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedPeriod("year")}>
                    Full Year
                    {selectedPeriod === "year" && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Quarters</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setSelectedPeriod("q1")}>
                    Q1 (Jan-Mar)
                    {selectedPeriod === "q1" && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedPeriod("q2")}>
                    Q2 (Apr-Jun)
                    {selectedPeriod === "q2" && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedPeriod("q3")}>
                    Q3 (Jul-Sep)
                    {selectedPeriod === "q3" && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedPeriod("q4")}>
                    Q4 (Oct-Dec)
                    {selectedPeriod === "q4" && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => fetchFinancialFlow(selectedPeriod)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="p-6 pl-2">
        {!mounted ? <div className="h-full" /> : <ResponsiveContainer width="100%" height={350} minWidth={0} minHeight={0}>
          {renderChart()}
        </ResponsiveContainer>}
      </div>
    </div>
  );
}

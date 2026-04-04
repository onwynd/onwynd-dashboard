"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { useCurrencyStore } from "@/store/currency-store";
import type { KpiDefinition } from "@/lib/kpi/config";

interface KpiCardProps {
  definition: KpiDefinition;
  /** Current value (number) */
  value: number | null | undefined;
  /** Previous period value for % change calculation */
  prevValue?: number | null;
  /** Historical data points for the sparkline */
  sparkline?: number[];
  isLoading?: boolean;
}

function getAnomalyStatus(
  value: number,
  def: KpiDefinition
): "ok" | "warn" | "alert" {
  if (def.alertAbove !== undefined && value > def.alertAbove) return "alert";
  if (def.alertBelow !== undefined && value < def.alertBelow) return "alert";
  if (def.warnBelow !== undefined && value < def.warnBelow) return "warn";
  return "ok";
}

const ANOMALY_STYLES = {
  ok:    { card: "",                          badge: "bg-emerald-50 text-emerald-700" },
  warn:  { card: "border-yellow-300",         badge: "bg-yellow-50 text-yellow-700"  },
  alert: { card: "border-red-400 shadow-red-100", badge: "bg-red-50 text-red-700"   },
};

function useFormatValue(value: number | null | undefined, format: KpiDefinition["format"]) {
  const { formatNGN, formatUSD } = useCurrencyStore();
  return useMemo(() => {
    if (value === null || value === undefined) return "—";
    switch (format) {
      case "currency_ngn": return formatNGN(value);
      case "currency_usd": return formatUSD(value);
      case "percent":      return `${value.toFixed(1)}%`;
      case "duration_h":   return `${value}h`;
      case "number":
      default:             return value.toLocaleString();
    }
  }, [value, format, formatNGN, formatUSD]);
}

function SparkLine({ data }: { data: number[] }) {
  const points = data.map((v, i) => ({ i, v }));
  const min = Math.min(...data);
  const max = Math.max(...data);
  const isFlat = min === max;

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={points}>
        <Line
          type="monotone"
          dataKey="v"
          dot={false}
          strokeWidth={1.5}
          stroke={isFlat ? "#94a3b8" : data[data.length - 1] >= data[0] ? "#16a34a" : "#ef4444"}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="bg-popover border rounded px-2 py-1 text-xs shadow-md">
                {payload[0].value}
              </div>
            );
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function KpiCard({ definition, value, prevValue, sparkline, isLoading }: KpiCardProps) {
  const formatted = useFormatValue(value, definition.format);

  const { pctChange, direction } = useMemo(() => {
    if (value === null || value === undefined || prevValue === null || prevValue === undefined || prevValue === 0) {
      return { pctChange: null, direction: "flat" as const };
    }
    const change = ((value - prevValue) / Math.abs(prevValue)) * 100;
    return {
      pctChange: change,
      direction: change > 0 ? ("up" as const) : change < 0 ? ("down" as const) : ("flat" as const),
    };
  }, [value, prevValue]);

  const anomaly = value !== null && value !== undefined
    ? getAnomalyStatus(value, definition)
    : "ok";

  const styles = ANOMALY_STYLES[anomaly];

  const CardInner = (
    <Card className={`relative overflow-hidden transition-all hover:shadow-md ${styles.card}`}>
      <CardContent className="pt-4 pb-3 px-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <>
            {/* Anomaly badge */}
            {anomaly !== "ok" && (
              <div className={`absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}>
                <AlertTriangle className="w-3 h-3" />
                {anomaly === "alert" ? "Alert" : "Watch"}
              </div>
            )}

            {/* Label */}
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate pr-16">
              {definition.label}
            </p>

            {/* Value */}
            <p className="text-2xl font-bold mt-1 tracking-tight">{formatted}</p>

            {/* Change indicator */}
            {pctChange !== null && (
              <div className={`flex items-center gap-1 text-xs mt-1 font-medium ${direction === "up" ? "text-emerald-600" : direction === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                {direction === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : direction === "down" ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                <span>{Math.abs(pctChange).toFixed(1)}% vs last period</span>
              </div>
            )}

            {/* SparkLine */}
            {sparkline && sparkline.length > 1 && (
              <div className="mt-2 -mx-1">
                <SparkLine data={sparkline} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (definition.href && !isLoading) {
    return <Link href={definition.href} className="block no-underline">{CardInner}</Link>;
  }
  return CardInner;
}

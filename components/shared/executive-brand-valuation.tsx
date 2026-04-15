"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrencyStore } from "@/store/currency-store";
import { useExecutiveIntelligenceStore } from "@/store/executive-intelligence-store";
import { cn } from "@/lib/utils";

interface ExecutiveBrandValuationProps {
  mode?: "chip" | "panel";
  className?: string;
}

function fmtPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function ExecutiveBrandValuation({ mode = "chip", className }: ExecutiveBrandValuationProps) {
  const fetchSnapshot = useExecutiveIntelligenceStore((s) => s.fetchSnapshot);
  const snapshot = useExecutiveIntelligenceStore((s) => s.snapshot);
  const isLoading = useExecutiveIntelligenceStore((s) => s.isLoading);
  const formatNGN = useCurrencyStore((s) => s.formatNGN);
  const formatUSD = useCurrencyStore((s) => s.formatUSD);

  useEffect(() => {
    fetchSnapshot();
    const id = setInterval(() => {
      fetchSnapshot(true);
    }, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchSnapshot]);

  if (!snapshot) {
    if (mode === "chip") return null;
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="py-3 text-xs text-muted-foreground">
          {isLoading ? "Loading brand valuation..." : "Brand valuation unavailable"}
        </CardContent>
      </Card>
    );
  }

  const valuationNgn = formatNGN(snapshot.brandValuation.value.ngn);
  const valuationUsd = formatUSD(snapshot.brandValuation.value.usd, 0);
  const confidenceTone =
    snapshot.brandValuation.confidence === "high"
      ? "bg-green-100 text-green-700 border-0"
      : snapshot.brandValuation.confidence === "medium"
        ? "bg-amber-100 text-amber-700 border-0"
        : "bg-slate-100 text-slate-700 border-0";

  if (mode === "chip") {
    return (
      <div className={cn("hidden xl:flex items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-1.5", className)}>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none">Daily Brand Valuation</p>
          <p className="text-xs font-semibold leading-tight truncate">{valuationNgn} / {valuationUsd}</p>
        </div>
        <Badge className={confidenceTone}>{snapshot.brandValuation.confidence}</Badge>
        <Badge variant="outline" className="text-[10px]">{fmtPct(snapshot.brandValuation.change7dPct)} 7d</Badge>
      </div>
    );
  }

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardContent className="py-3">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Daily Brand Valuation (CEO/COO AI)</p>
            <p className="text-sm font-semibold">{valuationNgn} / {valuationUsd}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={confidenceTone}>{snapshot.brandValuation.confidence} confidence</Badge>
            <Badge variant="outline">{fmtPct(snapshot.brandValuation.change7dPct)} 7d</Badge>
            <Badge variant="outline">{fmtPct(snapshot.brandValuation.change30dPct)} 30d</Badge>
          </div>
        </div>
        <div className="mt-2 grid gap-1 sm:grid-cols-3 text-xs">
          {snapshot.brandValuation.drivers.map((driver) => (
            <div key={driver.label} className="rounded-md border bg-background/70 px-2 py-1">
              <p className="text-muted-foreground">{driver.label}</p>
              <p className="font-medium">Score: {driver.score}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

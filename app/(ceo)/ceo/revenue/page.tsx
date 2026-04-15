"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCEOStore } from "@/store/ceo-store";
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, BarChart, Bar,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Flame } from "lucide-react";

export default function CEORevenuePage() {
  const isLoading = useCEOStore((s) => s.isLoading);
  const period = useCEOStore((s) => s.period);
  const setPeriod = useCEOStore((s) => s.setPeriod);
  const revenue = useCEOStore((s) => s.revenueSeries);
  const kpis = useCEOStore((s) => s.kpis);
  const fetchAll = useCEOStore((s) => s.fetchAll);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const mrrKpi = kpis.find((k) => k.id === "mrr");
  const arrKpi = kpis.find((k) => k.id === "arr");
  const burnKpi = kpis.find((k) => k.id === "burn");
  const runwayKpi = kpis.find((k) => k.id === "runway");

  const lastRev = revenue.at(-1);
  const prevRev = revenue.length > 1 ? revenue[revenue.length - 2] : undefined;
  const revChange = lastRev && prevRev && prevRev.value > 0
    ? ((lastRev.value - prevRev.value) / prevRev.value * 100).toFixed(1)
    : null;

  const cards = [
    { title: "MRR", value: mrrKpi?.value ?? "—", icon: DollarSign, color: "text-emerald-500" },
    { title: "ARR", value: arrKpi?.value ?? "—", icon: TrendingUp, color: "text-blue-500" },
    { title: "Burn Rate", value: burnKpi?.value ?? "—", icon: Flame, color: "text-red-500" },
    { title: "Runway", value: runwayKpi?.value ?? "—", icon: TrendingDown, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Revenue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">MRR, ARR, burn rate, and revenue trends.</p>
        </div>
        <div className="flex items-center gap-3">
          {revChange !== null && (
            <Badge variant={Number(revChange) >= 0 ? "default" : "destructive"}>
              {Number(revChange) >= 0 ? "+" : ""}{revChange}% vs prev period
            </Badge>
          )}
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">3 months</SelectItem>
              <SelectItem value="6months">6 months</SelectItem>
              <SelectItem value="12months">12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardContent className="p-5 flex items-center gap-4">
              <c.icon className={`size-8 shrink-0 ${c.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{c.title}</p>
                {isLoading ? <Skeleton className="h-6 w-16 mt-1" /> : (
                  <p className="text-xl font-bold">{c.value}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue vs Expenses chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            {!mounted || isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : revenue.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data for this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" name="Revenue" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="value2" name="Expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Net margin bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Net Margin per Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            {!mounted || isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : revenue.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data for this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue.map((r) => ({ name: r.name, margin: r.value - (r.value2 ?? 0) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="margin" name="Net Margin" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cooService } from "@/lib/api/coo";
import { 
  Cpu, 
  MessageSquare, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  History,
  CheckCircle2,
  RefreshCw,
  Globe,
  Settings,
  Heart
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function AiOperationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await cooService.getAiOperations();
      setData(res.data.data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load AI operations data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  const { ai_usage, crisis_performance, provider_health } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Operations</h1>
          <p className="text-muted-foreground">Monitoring AI Companion performance and crisis detection</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Messages Today</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ai_usage?.total_today}</div>
            <p className="text-xs text-muted-foreground">Average: {ai_usage?.avg_messages_per_session} per session</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Crisis Flags (Month)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crisis_performance?.distress_flags_this_month}</div>
            <p className="text-xs text-muted-foreground">{crisis_performance?.avg_review_time_mins}m avg review time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Active AI Provider</CardTitle>
            <Cpu className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{provider_health?.current_provider}</div>
            <p className="text-xs text-muted-foreground">Error Rate: {provider_health?.error_rate_today}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Quota Hit Rate</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ai_usage?.quota_hit_rate}%</div>
            <p className="text-xs text-muted-foreground">Users hitting limits</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              AI Performance & Usage
            </CardTitle>
            <CardDescription>Volume and language breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium uppercase">Messages (Week)</span>
                <p className="text-xl font-bold">{ai_usage?.total_this_week}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium uppercase">Messages (Month)</span>
                <p className="text-xl font-bold">{ai_usage?.total_this_month}</p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-medium">Language Breakdown</span>
              <div className="space-y-2">
                {Object.entries(ai_usage?.by_language || {}).map(([lang, count]) => (
                  <div key={lang} className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 opacity-50" />
                      <span>{lang}</span>
                    </div>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Crisis Detection Performance
            </CardTitle>
            <CardDescription>Ethics and accuracy metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">False Positive Rate (Avg)</span>
              <Badge variant={crisis_performance?.false_positive_rate < 5 ? "default" : "destructive"}>
                {crisis_performance?.false_positive_rate}%
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Conversion to Session Booking</span>
              <span className="font-semibold">{crisis_performance?.conversion_to_booking}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Last Provider Switch</span>
              <span className="text-xs text-muted-foreground">Never</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm">Fallback Activations Today</span>
              <Badge variant={provider_health?.fallback_activations === 0 ? "outline" : "destructive"}>
                {provider_health?.fallback_activations}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            AI Provider Status Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Last Check</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium capitalize">{provider_health?.current_provider}</TableCell>
                <TableCell>450ms</TableCell>
                <TableCell>99.98%</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Operational</Badge>
                </TableCell>
                <TableCell className="text-right text-xs">
                  {new Date(provider_health?.last_success).toLocaleTimeString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium opacity-50">Anthropic (Fallback)</TableCell>
                <TableCell className="opacity-50">620ms</TableCell>
                <TableCell className="opacity-50">99.99%</TableCell>
                <TableCell>
                  <Badge variant="outline">Standby</Badge>
                </TableCell>
                <TableCell className="text-right text-xs opacity-50">
                  {new Date().toLocaleTimeString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

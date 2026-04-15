"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Clock, User, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import client from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface DistressItem {
  id: string;
  session_id: string;
  member_id: string;
  organization_id: number | null;
  risk_level: "low" | "medium" | "high" | "severe" | "critical";
  flagged_at: string;
  message_preview: string;
  resources_shown: boolean;
}

const RISK_COLOR: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  severe:   "bg-red-100 text-red-800 border-red-200",
  high:     "bg-orange-100 text-orange-800 border-orange-200",
  medium:   "bg-amber-100 text-amber-800 border-amber-200",
  low:      "bg-green-100 text-green-800 border-green-200",
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function DistressQueuePage() {
  const [items, setItems] = useState<DistressItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/clinical-advisor/distress-queue");
      setItems(res.data?.data ?? []);
    } catch {
      toast({ title: "Error", description: "Failed to load distress queue.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resolve = async (id: string) => {
    try {
      await client.patch(`/api/v1/clinical-advisor/distress-queue/${id}/resolve`, {
        resolution_type: "resolved",
        notes: "Reviewed and resolved by clinical advisor",
      });
      setItems(prev => prev.filter(i => i.id !== id));
      toast({ title: "Resolved", description: "Distress flag marked as resolved." });
    } catch {
      toast({ title: "Error", description: "Could not resolve item.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Distress Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            High-risk AI conversations flagged for clinical review.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                <Skeleton className="w-16 h-6 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="font-semibold">Queue is clear</p>
            <p className="text-sm text-muted-foreground">No active distress flags at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{items.length} active flag{items.length !== 1 ? "s" : ""}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {items.map(item => (
              <div key={item.id} className="flex items-start gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <Badge className={cn("shrink-0 text-xs capitalize", RISK_COLOR[item.risk_level])}>
                  {item.risk_level}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium text-sm">{item.member_id}</span>
                    <Clock className="h-3 w-3 text-muted-foreground ml-2" />
                    <span className="text-xs text-muted-foreground">{timeAgo(item.flagged_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.message_preview}</p>
                  <div className="flex gap-2 mt-1.5">
                    {item.resources_shown && (
                      <Badge variant="outline" className="text-xs">Resources shown</Badge>
                    )}
                    {item.organization_id && (
                      <Badge variant="outline" className="text-xs">Org #{item.organization_id}</Badge>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => resolve(item.id)}>
                  Resolve
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

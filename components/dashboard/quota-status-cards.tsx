"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Activity, Zap } from "lucide-react";
import Link from "next/link";
import client from "@/lib/api/client";

interface QuotaInfo {
  sessions_used?: number;
  sessions_limit?: number;
  sessions_remaining?: number;
  ai_messages_used?: number;
  ai_messages_limit?: number;
  ai_messages_remaining?: number;
  activities_used?: number;
  activities_limit?: number;
  activities_remaining?: number;
  is_unlimited?: boolean;
  // alternate shapes from different API responses
  used?: number;
  limit?: number;
  remaining?: number;
  messages_used?: number;
  messages_limit?: number;
  messages_remaining?: number;
  can_send?: boolean;
  quota_type?: string;
}

interface QuotaStatusData {
  sessions: { used: number; limit: number; remaining: number };
  ai: { used: number; limit: number; remaining: number };
  activities: { used: number; limit: number; remaining: number };
  isUnlimited: boolean;
}

function parseQuotaStatus(quotaRaw: QuotaInfo): QuotaStatusData {
  const sessions = {
    used: quotaRaw.sessions_used ?? quotaRaw.used ?? 0,
    limit: quotaRaw.sessions_limit ?? quotaRaw.limit ?? 5,
    remaining: quotaRaw.sessions_remaining ?? quotaRaw.remaining ?? 0,
  };
  const ai = {
    used: quotaRaw.ai_messages_used ?? quotaRaw.messages_used ?? 0,
    limit: quotaRaw.ai_messages_limit ?? quotaRaw.messages_limit ?? 10,
    remaining: quotaRaw.ai_messages_remaining ?? quotaRaw.messages_remaining ?? 0,
  };
  const activities = {
    used: quotaRaw.activities_used ?? 0,
    limit: quotaRaw.activities_limit ?? 2,
    remaining: quotaRaw.activities_remaining ?? 0,
  };
  const isUnlimited = quotaRaw.is_unlimited ?? false;
  return { sessions, ai, activities, isUnlimited };
}

function parseAiQuota(aiRaw: QuotaInfo): { used: number; limit: number; remaining: number } {
  return {
    used: aiRaw.messages_used ?? aiRaw.used ?? aiRaw.ai_messages_used ?? 0,
    limit: aiRaw.messages_limit ?? aiRaw.limit ?? aiRaw.ai_messages_limit ?? 10,
    remaining: aiRaw.messages_remaining ?? aiRaw.remaining ?? aiRaw.ai_messages_remaining ?? 0,
  };
}

interface QuotaBarProps {
  label: string;
  icon: React.ReactNode;
  used: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  colorClass: string;
}

function QuotaBar({ label, icon, used, limit, remaining, isUnlimited, colorClass }: QuotaBarProps) {
  const percent = isUnlimited || limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = !isUnlimited && percent >= 80;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          <span className={colorClass}>{icon}</span>
          {label}
        </span>
        <span className={`text-xs ${isNearLimit ? "text-orange-600 font-semibold" : "text-muted-foreground"}`}>
          {isUnlimited ? "Unlimited" : `${remaining} remaining`}
        </span>
      </div>
      {!isUnlimited && (
        <Progress
          value={percent}
          className={`h-2 ${isNearLimit ? "[&>div]:bg-orange-500" : "[&>div]:bg-primary"}`}
        />
      )}
      {isUnlimited && (
        <div className="h-2 rounded-full bg-green-100">
          <div className="h-2 rounded-full bg-green-500 w-full" />
        </div>
      )}
    </div>
  );
}

export function QuotaStatusCards() {
  const [data, setData] = useState<QuotaStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchQuota() {
      try {
        // Fetch both quota endpoints in parallel; AI quota may return different shape
        const [quotaRes, aiRes] = await Promise.allSettled([
          client.get("/api/v1/quota/status"),
          client.get("/api/v1/ai/quota"),
        ]);

        if (cancelled) return;

        const quotaRaw: QuotaInfo =
          quotaRes.status === "fulfilled"
            ? (quotaRes.value.data?.data ?? quotaRes.value.data ?? {})
            : {};

        const aiRaw: QuotaInfo =
          aiRes.status === "fulfilled"
            ? (aiRes.value.data?.data ?? aiRes.value.data ?? {})
            : {};

        const parsed = parseQuotaStatus(quotaRaw);

        // If the AI endpoint returned richer data, use it to override the AI slot
        if (aiRes.status === "fulfilled") {
          const aiParsed = parseAiQuota(aiRaw);
          // Only override if the AI endpoint gave meaningful data
          if (aiParsed.limit > 0) {
            parsed.ai = aiParsed;
          }
        }

        setData(parsed);
      } catch {
        // Silently skip — quota is informational only, don't block the dashboard
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchQuota();
    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const anyNearLimit =
    !data.isUnlimited &&
    (
      (data.sessions.limit > 0 && data.sessions.used / data.sessions.limit >= 0.8) ||
      (data.ai.limit > 0 && data.ai.used / data.ai.limit >= 0.8) ||
      (data.activities.limit > 0 && data.activities.used / data.activities.limit >= 0.8)
    );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Today&apos;s Usage
        </CardTitle>
        {anyNearLimit && (
          <Link href="/subscription">
            <Button variant="outline" size="sm" className="text-xs h-7">
              Upgrade
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <QuotaBar
          label="Therapy Sessions"
          icon={<Calendar className="h-3.5 w-3.5" />}
          used={data.sessions.used}
          limit={data.sessions.limit}
          remaining={data.sessions.remaining}
          isUnlimited={data.isUnlimited}
          colorClass="text-blue-500"
        />
        <QuotaBar
          label="AI Companion Messages"
          icon={<MessageSquare className="h-3.5 w-3.5" />}
          used={data.ai.used}
          limit={data.ai.limit}
          remaining={data.ai.remaining}
          isUnlimited={data.isUnlimited}
          colorClass="text-purple-500"
        />
        <QuotaBar
          label="Daily Activities"
          icon={<Activity className="h-3.5 w-3.5" />}
          used={data.activities.used}
          limit={data.activities.limit}
          remaining={data.activities.remaining}
          isUnlimited={data.isUnlimited}
          colorClass="text-green-500"
        />
      </CardContent>
    </Card>
  );
}

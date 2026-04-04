"use client";

import { useEffect, useState } from "react";
import { AlertBanner } from "./alert-banner";
import { StatsCards } from "./stats-cards";
import { PatientsTable } from "./patients-table";
import { useClinicalStore } from "@/store/clinical-store";
import { cn } from "@/lib/utils";
import client from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DistressQueueItem {
  id: string;
  session_id: string;
  member_id: string;
  organization_id: number | null;
  risk_level: 'low' | 'medium' | 'high' | 'severe' | 'critical';
  flagged_at: string;
  message_preview: string;
  resources_shown: boolean;
  type: 'ai_conversation';
}

function DistressQueueItem({ item, onResolve }: { item: DistressQueueItem; onResolve: (id: string) => void }) {
  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical':
      case 'severe':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'severe':
        return <AlertTriangle className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Clock className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center gap-2">
          {getRiskIcon(item.risk_level)}
          <Badge variant={getRiskBadgeVariant(item.risk_level)}>
            {item.risk_level.toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{item.member_id}</span>
            <span className="text-xs text-gray-500">{formatTimeAgo(item.flagged_at)}</span>
          </div>
          <p className="text-sm text-gray-600 truncate">{item.message_preview}</p>
          
          <div className="flex items-center gap-2 mt-1">
            {item.resources_shown && (
              <Badge variant="outline" className="text-xs">
                Resources provided
              </Badge>
            )}
            {item.organization_id && (
              <Badge variant="outline" className="text-xs">
                Org #{item.organization_id}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onResolve(item.id)}
        className="ml-4"
      >
        Resolve
      </Button>
    </div>
  );
}

function DistressQueueSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Distress Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 border-b border-gray-100">
              <Skeleton className="w-4 h-4" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyDistressQueue() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Distress Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600">No active distress flags</p>
          <p className="text-xs text-gray-500 mt-1">
            All high-risk conversations have been reviewed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardContent() {
  const showAlertBanner = useClinicalStore((state) => state.showAlertBanner);
  const showStatsCards = useClinicalStore((state) => state.showStatsCards);
  const showTable = useClinicalStore((state) => state.showTable);
  const layoutDensity = useClinicalStore((state) => state.layoutDensity);
  const fetchStats = useClinicalStore((state) => state.fetchStats);

  const [distressQueue, setDistressQueue] = useState<DistressQueueItem[]>([]);
  const [loadingDistress, setLoadingDistress] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch distress queue data periodically
  useEffect(() => {
    const fetchDistressQueue = async () => {
      try {
        setLoadingDistress(true);
        setError(null);

        const response = await client.get('/api/v1/clinical-advisor/distress-queue');
        setDistressQueue(response.data?.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoadingDistress(false);
      }
    };

    fetchDistressQueue();
    const interval = setInterval(fetchDistressQueue, 60000); // Refresh every 1 minute
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResolveDistressItem = async (id: string) => {
    try {
      await client.patch(`/api/v1/clinical-advisor/distress-queue/${id}/resolve`, {
        resolution_type: 'resolved',
        notes: 'Reviewed and resolved by clinical advisor',
      });
      setDistressQueue(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to resolve distress item:', err);
      alert('Failed to resolve distress item. Please try again.');
    }
  };

  if (loadingDistress) {
    return (
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          layoutDensity === "compact" && "p-2 sm:p-4 space-y-4",
          layoutDensity === "default" && "p-4 sm:p-6 space-y-6 sm:space-y-8",
          layoutDensity === "comfortable" && "p-6 sm:p-8 space-y-8 sm:space-y-10"
        )}
      >
        {showAlertBanner && <AlertBanner />}
        {showStatsCards && <StatsCards />}
        <DistressQueueSkeleton />
        {showTable && <PatientsTable />}
      </main>
    );
  }

  if (error) {
    return (
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          layoutDensity === "compact" && "p-2 sm:p-4 space-y-4",
          layoutDensity === "default" && "p-4 sm:p-6 space-y-6 sm:space-y-8",
          layoutDensity === "comfortable" && "p-6 sm:p-8 space-y-8 sm:space-y-10"
        )}
      >
        {showAlertBanner && <AlertBanner />}
        {showStatsCards && <StatsCards />}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Distress Queue Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
        {showTable && <PatientsTable />}
      </main>
    );
  }

  return (
    <main
      className={cn(
        "w-full flex-1 overflow-auto",
        layoutDensity === "compact" && "p-2 sm:p-4 space-y-4",
        layoutDensity === "default" && "p-4 sm:p-6 space-y-6 sm:space-y-8",
        layoutDensity === "comfortable" && "p-6 sm:p-8 space-y-8 sm:space-y-10"
      )}
    >
      {showAlertBanner && <AlertBanner />}
      {showStatsCards && <StatsCards />}
      
      {distressQueue.length === 0 ? (
        <EmptyDistressQueue />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Distress Queue ({distressQueue.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {distressQueue.map((item) => (
                <DistressQueueItem
                  key={item.id}
                  item={item}
                  onResolve={handleResolveDistressItem}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {showTable && <PatientsTable />}
    </main>
  );
}
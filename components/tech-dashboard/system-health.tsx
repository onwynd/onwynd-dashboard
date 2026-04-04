"use client";

import * as React from "react";
import client from "@/lib/api/client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Server, Database, HardDrive, Network, Loader2, Cpu, Activity } from "lucide-react";

interface ServiceHealth {
  status: string;
  uptime: string;
  latency: string;
}

interface SystemMetrics {
  cpu_usage: string;
  memory_usage: string;
  disk_usage: string;
}

interface HealthData {
  services: Record<string, ServiceHealth>;
  system: SystemMetrics;
  last_check: string;
}

export function SystemHealth() {
  const [healthData, setHealthData] = React.useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchHealth = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await client.get("/api/v1/tech/health");
      if (response.data.success) {
        setHealthData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch system health", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const getStatusIcon = (status: string) => {
    if (!status) return <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />;
    if (status === 'Operational') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === 'Degraded') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    if (status === 'Operational') return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (status === 'Degraded') return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  const services = [
    { name: "Database", key: "database", icon: Database },
    { name: "Redis Cache", key: "redis", icon: Server },
    { name: "Mail Server", key: "mail_server", icon: Network },
    { name: "Object Storage", key: "storage", icon: HardDrive },
    { name: "API Gateway", key: "api_gateway", icon: Network },
  ];

  if (!healthData && isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted/20" />
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const serviceData = healthData?.services?.[service.key];
        const status = serviceData?.status || 'Checking...';
        
        return (
          <Card key={service.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {service.name}
              </CardTitle>
              <service.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className="font-bold">{status}</span>
                </div>
                {serviceData && (
                  <Badge variant="outline" className={getStatusColor(status)}>
                    {serviceData.uptime} Uptime
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Response time: {serviceData?.latency || '...'}
              </p>
            </CardContent>
          </Card>
        );
      })}
      
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Real-time metrics and performance data (Last check: {healthData?.last_check ? new Date(healthData.last_check).toLocaleTimeString() : '...'})</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid gap-4 md:grid-cols-3">
             <div className="flex flex-col space-y-2 p-4 border rounded-md">
               <div className="flex items-center space-x-2">
                 <Cpu className="h-4 w-4 text-muted-foreground" />
                 <span className="text-sm font-medium">CPU Usage</span>
               </div>
               <div className="text-2xl font-bold">{healthData?.system?.cpu_usage || '...'}</div>
               <div className="h-2 bg-muted rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-blue-500" 
                   style={{ width: healthData?.system?.cpu_usage || '0%' }}
                 />
               </div>
             </div>
             
             <div className="flex flex-col space-y-2 p-4 border rounded-md">
               <div className="flex items-center space-x-2">
                 <Activity className="h-4 w-4 text-muted-foreground" />
                 <span className="text-sm font-medium">Memory Usage</span>
               </div>
               <div className="text-2xl font-bold">{healthData?.system?.memory_usage || '...'}</div>
               <div className="h-2 bg-muted rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-purple-500" 
                   style={{ width: healthData?.system?.memory_usage || '0%' }}
                 />
               </div>
             </div>
             
             <div className="flex flex-col space-y-2 p-4 border rounded-md">
               <div className="flex items-center space-x-2">
                 <HardDrive className="h-4 w-4 text-muted-foreground" />
                 <span className="text-sm font-medium">Disk Usage</span>
               </div>
               <div className="text-2xl font-bold">{healthData?.system?.disk_usage || '...'}</div>
               <div className="h-2 bg-muted rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-orange-500" 
                   style={{ width: healthData?.system?.disk_usage || '0%' }}
                 />
               </div>
             </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

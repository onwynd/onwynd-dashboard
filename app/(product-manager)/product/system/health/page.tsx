"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, CheckCircle, AlertTriangle, XCircle, Server, Database, Cloud, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/export-utils";

export default function PMSystemHealthPage() {
  const services = [
    { name: "API Gateway", status: "operational", uptime: "99.99%", latency: "45ms", icon: Cloud },
    { name: "Database Cluster", status: "operational", uptime: "99.95%", latency: "12ms", icon: Database },
    { name: "Auth Service", status: "operational", uptime: "99.99%", latency: "28ms", icon: Server },
    { name: "Payment Gateway", status: "degraded", uptime: "98.50%", latency: "150ms", icon: Activity },
    { name: "Notification Service", status: "operational", uptime: "99.90%", latency: "35ms", icon: Server },
  ];

  const incidents = [
    { title: "Payment Gateway Latency", description: "Investigating high latency on payment processing.", status: "Investigating", time: "10m ago" },
    { title: "Database Maintenance", description: "Scheduled maintenance completed successfully.", status: "Resolved", time: "2 days ago" },
  ];

  const handleExport = () => {
    const headers = ["Type", "Name", "Status/Description", "Uptime/Time", "Latency"];
    const rows: Array<Record<string, unknown>> = [];
    services.forEach((s) => {
      rows.push({
        Type: "Service",
        Name: s.name,
        "Status/Description": s.status,
        "Uptime/Time": s.uptime,
        Latency: s.latency,
      });
    });
    incidents.forEach((i) => {
      rows.push({
        Type: "Incident",
        Name: i.title,
        "Status/Description": `${i.description} - Status: ${i.status}`,
        "Uptime/Time": i.time,
        Latency: "N/A",
      });
    });
    downloadCSV("system_health_report.csv", headers, rows);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {service.name}
              </CardTitle>
              <service.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mt-2">
                {service.status === 'operational' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {service.status === 'degraded' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                {service.status === 'down' && <XCircle className="h-5 w-5 text-red-500" />}
                <span className="font-bold capitalize">{service.status}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Uptime: {service.uptime}</span>
                <span>Latency: {service.latency}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>
            Log of recent system incidents and maintenance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidents.map((incident, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{incident.title}</p>
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={incident.status === 'Investigating' ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-50 text-green-700 border-green-200"}>
                    {incident.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{incident.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

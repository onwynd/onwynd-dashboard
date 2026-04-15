
// filepath: components/admin-dashboard/quota-widget.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { QuotaOverview } from "@/store/admin-store";

interface QuotaWidgetProps {
  overview: QuotaOverview | null;
}

export function QuotaWidget({ overview }: QuotaWidgetProps) {
  if (!overview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quota Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No quota data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quota Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(overview).map(([key, value]) => {
          const percentage = (value.usage / value.limit) * 100;
          return (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}</span>
                <span className="text-sm text-muted-foreground">
                  {value.usage.toLocaleString()} / {value.limit.toLocaleString()}
                </span>
              </div>
              <ProgressBar value={percentage} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

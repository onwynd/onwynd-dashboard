"use client";

import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMarketingStore } from "@/store/marketing-store";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25",
  paused: "bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25",
  completed: "bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-500/25",
  draft: "bg-slate-500/15 text-slate-700 dark:text-slate-400 hover:bg-slate-500/25",
};

export function CampaignsList() {
  const campaigns = useMarketingStore((state) => state.campaigns);
  const fetchCampaigns = useMarketingStore((state) => state.fetchCampaigns);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Impressions</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>Conversions</TableHead>
            <TableHead>Budget/Spend</TableHead>
            <TableHead>Start Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">
                <div>
                  {campaign.name}
                  <div className="text-xs text-muted-foreground">{campaign.id}</div>
                </div>
              </TableCell>
              <TableCell className="capitalize">{campaign.type}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusColors[campaign.status]}
                >
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell>{(campaign.metrics?.impressions || 0).toLocaleString()}</TableCell>
              <TableCell>{(campaign.metrics?.clicks || 0).toLocaleString()}</TableCell>
              <TableCell>{(campaign.metrics?.conversions || 0).toLocaleString()}</TableCell>
              <TableCell>
                <div>
                  <div className="text-xs text-muted-foreground">Budget: ${campaign.budget.toFixed(2)}</div>
                  {campaign.metrics?.spend && <div>Spend: ${campaign.metrics.spend.toFixed(2)}</div>}
                </div>
              </TableCell>
              <TableCell>
                {campaign.start_date ? format(new Date(campaign.start_date), "MMM d, yyyy") : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

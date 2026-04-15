"use client";

import { useEffect, useState } from "react";
import { therapistService } from "@/lib/api/therapist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Loader2 } from "lucide-react";

// TODO: Replace with actual data from the API once available
interface EarningsBreakdownData {
  gross_session_earnings: number;
  platform_commission_percent: number;
  net_payout: number;
  commission_tier_label: string;
  is_founding_therapist: boolean;
}

export function EarningsBreakdown() {
  const [earnings, setEarnings] = useState<EarningsBreakdownData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        // const response = await therapistService.getEarnings();
        // setEarnings(response.data);

        // MOCK DATA
        setEarnings({
          gross_session_earnings: 12500,
          platform_commission_percent: 15,
          net_payout: 10625,
          commission_tier_label: "Founding Therapist — 15% commission",
          is_founding_therapist: true,
        });

      } catch (error) {
        console.error("Failed to fetch earnings breakdown:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading earnings...</span>
        </CardContent>
      </Card>
    );
  }

  if (!earnings) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Earnings Breakdown</span>
          {earnings.is_founding_therapist && (
            <Badge className="bg-green-100 text-green-800">
              🎉 Founding Therapist Rate — Locked In
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-muted-foreground">Gross Session Earnings</span>
          <span className="text-2xl font-semibold">
            ${earnings.gross_session_earnings.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Platform Commission</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Standard rate is 20%. Your founding rate is 15%.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-2xl font-semibold">
            {earnings.platform_commission_percent}%
          </span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-muted-foreground">Net Payout</span>
          <span className="text-2xl font-semibold text-green-600">
            ${earnings.net_payout.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Megaphone, ChevronRight } from "lucide-react";

export function AlertBanner() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-linear-to-r from-purple-500/10 via-pink-500/10 to-red-500/10">
      <div className="flex items-start sm:items-center gap-4">
        <div className="p-2 bg-background rounded-full shadow-xs">
          <Megaphone className="size-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">New Campaign: Summer Wellness</h4>
          <p className="text-xs text-muted-foreground">
            Earn <span className="font-bold text-foreground">2x rewards</span> for every referral who signs up for the Summer Wellness program before July 31st.
          </p>
        </div>
      </div>
      <Button size="sm" className="gap-2 whitespace-nowrap">
        View Details
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

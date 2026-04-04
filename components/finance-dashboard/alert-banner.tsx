"use client";

import { Button } from "@/components/ui/button";
import { FileDown, ChevronRight } from "lucide-react";

export function AlertBanner() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10">
      <div className="flex items-start sm:items-center gap-4">
        <div className="p-2 bg-background rounded-full shadow-xs">
          <FileDown className="size-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">Monthly Report Ready</h4>
          <p className="text-xs text-muted-foreground">
            The financial report for <span className="font-bold text-foreground">May 2024</span> is available for download.
          </p>
        </div>
      </div>
      <Button size="sm" className="gap-2 whitespace-nowrap">
        Download Report
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

"use client";

import { ChevronDown, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AlertBanner() {
  return (
    <div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
      <div className="flex items-start gap-4 sm:items-center">
        <span className="text-4xl" aria-hidden="true">
          🩺
        </span>
        <p className="text-sm leading-relaxed sm:text-base">
          <span className="text-muted-foreground">You have </span>
          <span className="font-semibold">
            12 patients due for clinical review,
          </span>
          <span> and </span>
          <span className="font-semibold">5 urgent follow-ups</span>
          <span className="text-muted-foreground">
            {" "}
            that need attention today.
          </span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-2">
          <FileOutput className="size-4" />
          Export
        </Button>
        <Button
          size="sm"
          className="gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          New
          <span className="h-4 w-px bg-background/20" />
          <ChevronDown className="size-4" />
        </Button>
      </div>
    </div>
  );
}

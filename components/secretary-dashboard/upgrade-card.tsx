"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function UpgradeCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4">
      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">OnWynd Pro</span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Unlock unlimited sessions, advanced analytics, and priority support with a Pro plan.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-full justify-center gap-1.5 text-xs"
          asChild
        >
          <Link href="/settings?tab=subscription">
            Manage Subscription
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

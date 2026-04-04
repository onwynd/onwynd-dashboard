"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, CreditCard } from "lucide-react";
import Link from "next/link";

/**
 * Settings-page stub — full plan management lives at /admin/subscriptions.
 */
export function SubscriptionSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Plans
        </CardTitle>
        <CardDescription>
          Manage pricing tiers, benefits, activation, and plan availability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/admin/subscriptions">
          <Button className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Open Subscription Manager
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground mt-3">
          Create, edit, toggle on/off, and delete plans — including NGN &amp; USD pricing,
          dynamic benefits lists, plan types (Individual, Corporate, University, Faith &amp; NGO),
          and display badges (Most Popular, Recommended).
        </p>
      </CardContent>
    </Card>
  );
}

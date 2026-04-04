"use client";

import Link from "next/link";
import { LockKeyhole, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaywallScreenProps {
  code: string;
}

export function PaywallScreen({ code }: PaywallScreenProps) {
  const isExpired = code === "SUBSCRIPTION_EXPIRED";

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center gap-6 min-h-[60vh]">
      <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
        <LockKeyhole className="size-10 text-destructive" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold">
          {isExpired ? "Subscription Expired" : "Account Restricted"}
        </h2>
        <p className="text-muted-foreground">
          {isExpired
            ? "Your institutional subscription has expired. Renew now to restore access to your dashboard, members, and documents."
            : "Access to this portal has been restricted. Please renew your subscription to continue using the platform."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg">
          <Link href="/institutional/subscription">
            <RefreshCcw className="mr-2 size-4" />
            Renew Subscription
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href="mailto:support@onwynd.com">Contact Support</a>
        </Button>
      </div>
    </div>
  );
}

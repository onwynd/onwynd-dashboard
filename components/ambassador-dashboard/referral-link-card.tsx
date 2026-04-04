"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ambassadorService } from "@/lib/api/ambassador";
import { Copy, Check, Link } from "lucide-react";
import { toast } from "sonner";

export function ReferralLinkCard() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    ambassadorService.getReferralCode()
      .then((data: unknown) => {
        const d = data as Record<string, unknown> | null;
        const code = (d?.code ?? d?.referral_code ?? d?.link ?? null) as string | null;
        setReferralCode(code);
      })
      .catch(() => {});
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://onwynd.com";
  const referralLink = referralCode ? `${baseUrl}/register?ref=${referralCode}` : null;

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link className="w-4 h-4 text-primary" />
          Your Referral Link
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-lg px-4 py-2 text-sm font-mono truncate text-muted-foreground">
            {referralLink ?? "Loading referral link…"}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={!referralLink}
            className="shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        {referralCode && (
          <p className="text-xs text-muted-foreground mt-2">
            Code: <span className="font-semibold text-foreground">{referralCode}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

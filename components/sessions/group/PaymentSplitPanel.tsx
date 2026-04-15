"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SessionModeId } from "@/lib/constants/groupSessionModes";
import type { PaymentModel } from "@/types/groupSession";

interface PaymentSplitPanelProps {
  mode: SessionModeId;
  totalFee: number;
  declaredSize: number;
  paymentModel: PaymentModel;
  onPaymentModelChange: (model: PaymentModel) => void;
  onPay: (paymentRef: string) => void;
  currency?: string;
}

const INDIVIDUAL_SESSION_BENCHMARK = 10000;

export function PaymentSplitPanel({
  mode,
  totalFee,
  declaredSize,
  paymentModel,
  onPaymentModelChange,
  onPay,
  currency = "₦",
}: PaymentSplitPanelProps) {
  const [paying, setPaying] = useState(false);

  const size = declaredSize > 0 ? declaredSize : 1;
  const perPerson = Math.round(totalFee / size);
  const orgPays = paymentModel === "full" ? totalFee : perPerson;
  const savings = INDIVIDUAL_SESSION_BENCHMARK - perPerson;
  const showSplitSavings =
    paymentModel === "split" &&
    ["family", "friends"].includes(mode) &&
    savings > 0;

  const canSplit = mode !== "couples";

  const handlePay = async () => {
    setPaying(true);
    try {
      // Trigger Paystack via the existing PaystackService pattern.
      // The parent page handles the actual Paystack popup/redirect;
      // we emit a sentinel ref here to signal intent.
      onPay("__paystack_pending__");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">
          Payment breakdown
        </p>

        {/* Fee rows */}
        <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 bg-card">
            <span className="text-sm text-muted-foreground">Session total</span>
            <span className="text-sm font-semibold text-foreground">
              {currency}
              {totalFee.toLocaleString()}
            </span>
          </div>
          {canSplit && (
            <div className="flex justify-between items-center px-4 py-3 bg-card">
              <span className="text-sm text-muted-foreground">
                Per person ({size} participants)
              </span>
              <span className="text-sm font-semibold text-foreground">
                {currency}
                {perPerson.toLocaleString()}
              </span>
            </div>
          )}
          <div
            className="flex justify-between items-center px-4 py-3"
            style={{ backgroundColor: "var(--teal-light)" }}
          >
            <span className="text-sm font-bold" style={{ color: "var(--teal)" }}>
              You pay
            </span>
            <span
              className="text-base font-bold"
              style={{ color: "var(--teal)" }}
            >
              {currency}
              {orgPays.toLocaleString()}
            </span>
          </div>
        </div>

        {showSplitSavings && (
          <p className="text-xs text-muted-foreground mt-2">
            {currency}
            {perPerson.toLocaleString()} each — more affordable than individual
            therapy at {currency}
            {INDIVIDUAL_SESSION_BENCHMARK.toLocaleString()} per session
          </p>
        )}
      </div>

      {/* Payment model toggle (not for couples — always full) */}
      {canSplit && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Who pays?
          </p>
          <div className="flex gap-2">
            {(["split", "full"] as PaymentModel[]).map((model) => (
              <button
                key={model}
                type="button"
                onClick={() => onPaymentModelChange(model)}
                className="flex-1 text-sm font-semibold py-2.5 rounded-lg border-2 transition-all duration-150"
                style={{
                  borderColor:
                    paymentModel === model
                      ? "var(--teal)"
                      : "hsl(var(--border))",
                  backgroundColor:
                    paymentModel === model
                      ? "var(--teal-light)"
                      : "hsl(var(--card))",
                  color:
                    paymentModel === model
                      ? "var(--teal)"
                      : "hsl(var(--muted-foreground))",
                }}
              >
                {model === "split" ? "Split with group" : "I pay in full"}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handlePay}
        disabled={paying}
        className="w-full font-bold py-3"
        style={{ backgroundColor: "var(--amber-warm)", color: "#fff" }}
      >
        {paying && <Loader2 size={14} className="mr-2 animate-spin" />}
        {paymentModel === "full"
          ? `Pay ${currency}${totalFee.toLocaleString()} & Confirm Session`
          : `Pay ${currency}${perPerson.toLocaleString()} & Share Invite Link`}
      </Button>
    </div>
  );
}

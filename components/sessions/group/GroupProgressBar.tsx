"use client";

import type { SessionModeId } from "@/lib/constants/groupSessionModes";
import type { PaymentModel } from "@/types/groupSession";

interface GroupProgressBarProps {
  mode: SessionModeId;
  joined: number;
  total: number;
  paymentModel: PaymentModel;
}

function getMessage(
  mode: SessionModeId,
  joined: number,
  total: number
): string {
  if (mode === "couples") {
    if (joined === 0) return "Waiting for your partner to join";
    if (joined === 1) return "Your partner has joined — confirm to book";
    return "You're both in. Ready to confirm ✓";
  }
  if (mode === "family") {
    if (joined === 0) return "Share the link — your family's spot is reserved";
    if (joined === 1) return "One family member has joined";
    if (joined === 2) return "Two members in — keep sharing";
    if (joined >= total) return "Your family is all set ✓";
    return `${joined} of ${total} family members have joined`;
  }
  if (mode === "friends") {
    if (joined === 0) return "Share the link with your group";
    if (joined === 1) return "One friend in — add a couple more";
    if (joined === 2) return "Almost at minimum — one more to confirm";
    if (joined >= total) return "Group confirmed ✓";
    return `${joined} friends have joined`;
  }
  // corporate / university
  if (joined >= total) return "Team booked. Calendar invites will be sent ✓";
  return `${joined} of ${total} team members have joined`;
}

export function GroupProgressBar({
  mode,
  joined,
  total,
  paymentModel,
}: GroupProgressBarProps) {
  const progress = total > 0 ? Math.min((joined / total) * 100, 100) : 0;
  const isComplete = joined >= total;
  const message = getMessage(mode, joined, total);

  return (
    <div className="space-y-3">
      {/* Avatar stack */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < joined;
          return (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={{
                backgroundColor: filled ? "var(--amber-warm)" : "hsl(var(--muted))",
                color: filled ? "#fff" : "hsl(var(--muted-foreground))",
                transform: filled ? "scale(1.1)" : "scale(1)",
              }}
            >
              {filled ? "✓" : i + 1}
            </div>
          );
        })}
        <span className="text-xs text-muted-foreground ml-1">
          {joined}/{total}
        </span>
      </div>

      {/* Gold progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: isComplete ? "var(--teal)" : "var(--amber-warm)",
          }}
        />
      </div>

      {/* Message */}
      <p
        className="text-sm font-medium"
        style={{ color: isComplete ? "var(--teal)" : "hsl(var(--foreground))" }}
      >
        {message}
      </p>

      {paymentModel === "split" && !isComplete && (
        <p className="text-xs text-muted-foreground">
          Session confirms once the minimum participants join and pay.
        </p>
      )}
    </div>
  );
}

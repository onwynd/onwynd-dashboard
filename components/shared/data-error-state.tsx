import { AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function DataErrorState({
  message = "Couldn't load this data",
  onRetry,
  className,
}: DataErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="w-12 h-12 rounded-full bg-amber-warm/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-amber-warm" />
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">{message}</p>
      <p className="text-xs text-gray-400 mb-4">Please check your connection and try again.</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

/** Aggregate-data-only trust banner for clinical reports */
export function AggregateBanner() {
  return (
    <div className="bg-teal/5 border border-teal/20 rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
      <ShieldCheck className="w-4 h-4 text-teal flex-shrink-0" />
      <p className="text-sm text-teal-800">
        This view shows aggregate platform data only. No individual patient information is displayed.
      </p>
    </div>
  );
}

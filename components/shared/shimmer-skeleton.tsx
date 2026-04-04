import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
}

/** Inline shimmer block — replaces any content while loading */
export function Shimmer({ className }: ShimmerProps) {
  return <div className={cn("rounded skeleton-shimmer", className)} />;
}

/** Shimmer card that matches stat-card shape */
export function StatCardShimmer({ className }: ShimmerProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-100 shadow-sm p-5", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
        <div className="h-4 w-16 rounded skeleton-shimmer" />
      </div>
      <div className="h-7 w-24 rounded skeleton-shimmer mb-2" />
      <div className="h-3 w-32 rounded skeleton-shimmer" />
    </div>
  );
}

/** Shimmer grid of stat cards */
export function StatCardsShimmer({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardShimmer key={i} />
      ))}
    </div>
  );
}

/** Shimmer table row */
export function TableRowShimmer({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded skeleton-shimmer" />
        </td>
      ))}
    </tr>
  );
}

/** Shimmer table body */
export function TableBodyShimmer({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowShimmer key={i} cols={cols} />
      ))}
    </>
  );
}

/** Full-width shimmer block for chart areas */
export function ChartShimmer({ className }: ShimmerProps) {
  return (
    <div className={cn("w-full h-64 rounded-xl skeleton-shimmer", className)} />
  );
}

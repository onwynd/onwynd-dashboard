
// filepath: components/ui/responsive-table.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const ResponsiveTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className="w-full overflow-x-auto rounded-md border">
    <div className={cn("w-full", className)} {...props} />
  </div>
));
ResponsiveTable.displayName = "ResponsiveTable";

export { ResponsiveTable };

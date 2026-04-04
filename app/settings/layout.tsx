import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Settings" },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card px-4 py-3">
        <Link
          href="javascript:history.back()"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back
        </Link>
      </div>
      <main>{children}</main>
    </div>
  );
}

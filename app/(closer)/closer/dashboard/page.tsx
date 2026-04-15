
// filepath: app/(closer)/closer/dashboard/page.tsx
import { DashboardContent } from "@/components/closer-dashboard/content";
import { StickyNotes } from "@/components/shared/sticky-notes";

export default function CloserDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardContent />
      <StickyNotes roleSlug="closer" />
    </div>
  );
}


// filepath: app/(finder)/finder/dashboard/page.tsx
import { DashboardContent } from "@/components/finder-dashboard/content";
import { StickyNotes } from "@/components/shared/sticky-notes";

export default function FinderDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardContent />
      <StickyNotes roleSlug="finder" />
    </div>
  );
}


// filepath: app/(builder)/builder/dashboard/page.tsx
import { DashboardContent } from "@/components/builder-dashboard/content";
import { StickyNotes } from "@/components/shared/sticky-notes";

export default function BuilderDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardContent />
      <StickyNotes roleSlug="builder" />
    </div>
  );
}

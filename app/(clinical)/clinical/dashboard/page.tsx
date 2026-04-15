
// filepath: app/(clinical)/clinical/dashboard/page.tsx
import { DashboardContent } from "@/components/clinical-dashboard/content";
import { StickyNotes } from "@/components/shared/sticky-notes";

export default function ClinicalDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardContent />
      <StickyNotes roleSlug="clinical_advisor" />
    </div>
  );
}

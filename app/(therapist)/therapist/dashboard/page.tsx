
// filepath: app/(therapist)/therapist/dashboard/page.tsx
import { DashboardContent } from "@/components/therapist-dashboard/content";
import { StickyNotes } from "@/components/shared/sticky-notes";

export default function TherapistDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardContent />
      <StickyNotes roleSlug="therapist" />
    </div>
  );
}

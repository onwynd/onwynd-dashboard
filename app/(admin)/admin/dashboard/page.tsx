
// filepath: app/(admin)/admin/dashboard/page.tsx
import { DashboardContent } from "@/components/admin-dashboard/content";
import { StickyNotes } from "@/components/shared/sticky-notes";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardContent />
      <StickyNotes roleSlug="admin" showAll />
    </div>
  );
}

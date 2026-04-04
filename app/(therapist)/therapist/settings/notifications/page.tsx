import type { Metadata } from "next";
import { NotificationPreferencesPanel } from "@/components/shared/notification-preferences";

export const metadata: Metadata = { title: "Notification Settings" };

export default function TherapistNotificationPreferencesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold">Notification preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how and when Onwynd contacts you. You can turn off any channel at any time.
        </p>
      </div>
      <NotificationPreferencesPanel />
    </div>
  );
}

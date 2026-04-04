"use client";

import { Users, Clipboard, Wallet, FileText, Calendar, Activity } from "lucide-react";

type IconKey = "users" | "clipboard" | "wallet" | "invoice" | "calendar" | "activity" | "filetext";
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
const iconMap: Record<IconKey, IconComponent> = {
  users: Users,
  clipboard: Clipboard,
  wallet: Wallet,
  invoice: FileText,
  calendar: Calendar,
  activity: Activity,
  filetext: FileText,
};

interface StatCardProps {
  title: string;
  value: string;
  icon: IconKey | string;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  const key = (typeof icon === "string" ? icon.toLowerCase() : icon) as IconKey;
  const Icon = iconMap[key] || Users;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-medium text-foreground">{value}</p>
        </div>
        <div className="flex size-16 items-center justify-center rounded-lg bg-muted border border-border">
          <Icon className="size-8 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { Users, Activity, Wallet, Clock, FileText } from "lucide-react";

const iconMap = {
  users: Users,
  activity: Activity,
  wallet: Wallet,
  clock: Clock,
  invoice: FileText,
};

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof iconMap;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  const Icon = iconMap[icon] || Users;

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

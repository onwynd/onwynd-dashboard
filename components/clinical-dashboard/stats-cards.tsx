"use client";

import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Calendar,
  File,
  Info,
} from "lucide-react";
import { useClinicalStore } from "@/store/clinical-store";

type IconKey = "users" | "file-text" | "calendar" | "file" | "info";
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
const iconMap: Record<IconKey, IconComponent> = {
  users: Users,
  "file-text": FileText,
  calendar: Calendar,
  file: File,
  info: Info,
};

export function StatsCards() {
  const stats = useClinicalStore((state) => state.stats);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {stats.map((stat) => {
        const Icon = iconMap[((stat.iconName || "users").toLowerCase() as IconKey)] || Users;
        const SubtitleIcon = iconMap[((stat.iconName || "file").toLowerCase() as IconKey)] || File;

        return (
          <div
            key={stat.title}
            className="relative p-5 rounded-xl border bg-card overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-black/5 to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between">
              <div className="flex flex-col gap-6">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-[26px] font-semibold tracking-tight">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <SubtitleIcon className="size-4" />
                  <span className="text-sm font-medium">{stat.subtitle}</span>
                </div>
              </div>
              <Button variant="outline" size="icon" className="size-10">
                <Icon className="size-5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

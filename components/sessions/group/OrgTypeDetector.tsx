"use client";

import { useState } from "react";
import { Building2, UserPlus, Users } from "lucide-react";
import type { OrganiserType } from "@/types/groupSession";

interface OrgTypeDetectorProps {
  onTypeSelected: (type: OrganiserType, orgId?: string | number) => void;
}

const OPTIONS = [
  {
    type: "internal_org" as OrganiserType,
    icon: Building2,
    title: "My organisation",
    subtitle: "Already registered on Onwynd",
    color: "var(--teal)",
    bg: "var(--teal-light)",
  },
  {
    type: "external_org" as OrganiserType,
    icon: UserPlus,
    title: "New organisation",
    subtitle: "First time booking for your company or university",
    color: "var(--amber-warm)",
    bg: "var(--amber-light)",
  },
  {
    type: "individual" as OrganiserType,
    icon: Users,
    title: "Just us",
    subtitle: "Friends, family, or couples",
    color: "#9bb068",
    bg: "#e5ead7",
  },
];

export function OrgTypeDetector({ onTypeSelected }: OrgTypeDetectorProps) {
  const [selected, setSelected] = useState<OrganiserType | null>(null);
  const [hovering, setHovering] = useState<OrganiserType | null>(null);

  const handleSelect = (type: OrganiserType) => {
    setSelected(type);
    onTypeSelected(type);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          Who is this session for?
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose how you&apos;re booking this group session.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {OPTIONS.map(({ type, icon: Icon, title, subtitle, color, bg }) => {
          const isActive = selected === type;
          const isHovered = hovering === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => handleSelect(type)}
              onMouseEnter={() => setHovering(type)}
              onMouseLeave={() => setHovering(null)}
              className="relative text-left rounded-xl border-2 p-5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                borderColor: isActive || isHovered ? color : "hsl(var(--border))",
                backgroundColor: isActive ? bg : "hsl(var(--card))",
              }}
            >
              {isActive && (
                <span
                  className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <svg
                    width="10"
                    height="8"
                    viewBox="0 0 10 8"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}

              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: isActive ? `${color}22` : "hsl(var(--muted))" }}
              >
                <Icon
                  size={20}
                  style={{ color: isActive || isHovered ? color : "hsl(var(--muted-foreground))" }}
                />
              </div>

              <p
                className="font-semibold text-sm mb-1"
                style={{ color: isActive ? color : "hsl(var(--foreground))" }}
              >
                {title}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

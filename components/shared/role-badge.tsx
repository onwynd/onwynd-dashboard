import { cn } from "@/lib/utils";

export type RoleSlug =
  | "admin"
  | "ceo"
  | "coo"
  | "cgo"
  | "clinical_advisor"
  | "therapist"
  | "sales"
  | "finder"
  | "closer"
  | "relationship_manager"
  | "hr"
  | "institution_admin"
  | "university_admin"
  | "manager"
  | "employee"
  | "support"
  | "tech_team"
  | "product_manager"
  | "marketing"
  | "legal_advisor"
  | "compliance"
  | "ambassador"
  | "finance"
  | "partner"
  | "health_personnel"
  | string;

interface RoleConfig {
  label: string;
  className: string;
}

const ROLE_MAP: Record<string, RoleConfig> = {
  super_admin:          { label: "Super Admin",        className: "bg-[#0A1628] text-white"          },
  admin:                { label: "Admin",              className: "bg-[#0A1628] text-white"          },
  patient:              { label: "Member",             className: "bg-teal-light text-teal"          },
  user:                 { label: "Member",             className: "bg-teal-light text-teal"          },
  ceo:                  { label: "CEO",                className: "bg-[#C8922A]/10 text-[#C8922A]"  },
  coo:                  { label: "COO",                className: "bg-[#C8922A]/10 text-[#C8922A]"  },
  cgo:                  { label: "CGO",                className: "bg-[#C8922A]/10 text-[#C8922A]"  },
  clinical_advisor:     { label: "Clinical Advisor",   className: "bg-teal-light text-teal"         },
  therapist:            { label: "Therapist",           className: "bg-teal-light text-teal"         },
  sales:                { label: "Sales",               className: "bg-blue-50 text-blue-700"        },
  finder:               { label: "Finder",              className: "bg-blue-50 text-blue-700"        },
  closer:               { label: "Closer",              className: "bg-blue-50 text-blue-700"        },
  relationship_manager: { label: "Rel. Manager",        className: "bg-purple-50 text-purple-700"   },
  hr:                   { label: "HR Admin",            className: "bg-indigo-50 text-indigo-700"   },
  institution_admin:    { label: "Inst. Admin",         className: "bg-indigo-50 text-indigo-700"   },
  university_admin:     { label: "Univ. Admin",         className: "bg-emerald-50 text-emerald-700" },
  manager:              { label: "Manager",             className: "bg-slate-100 text-slate-700"    },
  employee:             { label: "Employee",            className: "bg-slate-100 text-slate-700"    },
  support:              { label: "Support",             className: "bg-orange-50 text-orange-700"   },
  tech_team:            { label: "Tech",                className: "bg-violet-50 text-violet-700"   },
  product_manager:      { label: "Product",             className: "bg-pink-50 text-pink-700"       },
  marketing:            { label: "Marketing",           className: "bg-rose-50 text-rose-700"       },
  legal_advisor:        { label: "Legal",               className: "bg-amber-50 text-amber-700"     },
  compliance:           { label: "Compliance",          className: "bg-yellow-50 text-yellow-700"   },
  ambassador:           { label: "Ambassador",          className: "bg-teal-light text-teal"         },
  finance:              { label: "Finance",             className: "bg-green-50 text-green-700"     },
  partner:              { label: "Partner",             className: "bg-cyan-50 text-cyan-700"       },
  health_personnel:     { label: "Health",              className: "bg-lime-50 text-lime-700"       },
};

interface RoleBadgeProps {
  role: RoleSlug;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = ROLE_MAP[role] ?? { label: role.replace(/_/g, " "), className: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize tracking-wide",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

/** Resolve a display label for a role slug */
export function getRoleLabel(role: RoleSlug): string {
  return ROLE_MAP[role]?.label ?? role.replace(/_/g, " ");
}

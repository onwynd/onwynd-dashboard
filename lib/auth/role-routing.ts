const DEFAULT_DASHBOARD = "/dashboard";

export const ROLE_DASHBOARD_PATHS = {
  admin: "/admin/dashboard",
  super_admin: "/admin/dashboard",
  president: "/president/dashboard",
  ceo: "/ceo/dashboard",
  coo: "/coo/dashboard",
  cgo: "/cgo/dashboard",
  cfo: "/cfo/dashboard",
  audit: "/audit/dashboard",
  vp_sales: "/vp-sales/dashboard",
  vp_marketing: "/vp-marketing/dashboard",
  vp_operations: "/vp-ops/dashboard",
  vp_product: "/vp-product/dashboard",
  finance: "/finance/dashboard",
  hr: "/hr/dashboard",
  marketing: "/marketing/dashboard",
  sales: "/sales/dashboard",
  closer: "/closer/dashboard",
  finder: "/finder/dashboard",
  builder: "/builder/dashboard",
  relationship_manager: "/rm/dashboard",
  support: "/support/dashboard",
  tech: "/tech/dashboard",
  tech_team: "/tech/dashboard",
  product_manager: "/product-manager/dashboard",
  compliance: "/compliance/dashboard",
  legal_advisor: "/legal/dashboard",
  therapist: "/therapist/dashboard",
  clinical_advisor: "/clinical/dashboard",
  manager: "/manager/dashboard",
  secretary: "/secretary/dashboard",
  employee: "/employee/dashboard",
  ambassador: "/ambassador/dashboard",
  partner: "/partner/dashboard",
  health_personnel: "/health-personnel/dashboard",
  corporate_hr: "/hr/dashboard",
  institutional: "/institutional/dashboard",
  institution_admin: "/institutional/dashboard",
  university_admin: "/university/dashboard",
  ngo_admin: "/ngo/dashboard",
} as const;

export type CanonicalRole = keyof typeof ROLE_DASHBOARD_PATHS;

const ROLE_ALIASES: Record<string, CanonicalRole> = {
  user: "therapist",
  patient: "therapist",
  institution: "institutional",
  university: "university_admin",
  ngo: "ngo_admin",
  legal: "legal_advisor",
  product: "product_manager",
  vp_ops: "vp_operations",
  vp_marketing_lead: "vp_marketing",
};

export const INSTITUTIONAL_ADMIN_ROLES = [
  "corporate_hr",
  "university_admin",
  "institutional",
  "institution_admin",
  "ngo_admin",
] as const satisfies CanonicalRole[];

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  president: "President",
  ceo: "CEO",
  coo: "COO",
  cgo: "CGO",
  cfo: "CFO",
  audit: "Audit",
  vp_sales: "VP Sales",
  vp_marketing: "VP Marketing",
  vp_operations: "VP Operations",
  vp_product: "VP Product",
  finance: "Finance",
  hr: "HR",
  marketing: "Marketing",
  sales: "Sales",
  closer: "Closer",
  finder: "Finder",
  builder: "Builder",
  relationship_manager: "Relationship Manager",
  support: "Support",
  tech: "Tech",
  tech_team: "Tech Team",
  product_manager: "Product Manager",
  compliance: "Compliance",
  legal_advisor: "Legal Advisor",
  therapist: "Therapist",
  clinical_advisor: "Clinical Advisor",
  manager: "Manager",
  secretary: "Secretary",
  employee: "Employee",
  ambassador: "Ambassador",
  partner: "Partner",
  health_personnel: "Health Personnel",
  corporate_hr: "Corporate HR",
  institutional: "Institutional",
  institution_admin: "Institution Admin",
  university_admin: "University Admin",
  ngo_admin: "NGO Admin",
};

function normalizeRole(role: string | null | undefined): CanonicalRole | null {
  if (!role) return null;
  const lowered = role.trim().toLowerCase();
  if (!lowered) return null;
  if (lowered in ROLE_DASHBOARD_PATHS) {
    return lowered as CanonicalRole;
  }
  return ROLE_ALIASES[lowered] ?? null;
}

export const ROLE_ALLOWED_PREFIXES: Record<CanonicalRole, string[]> = {
  super_admin: ["/admin/", "/ceo/", "/coo/", "/cfo/", "/cgo/", "/audit/"],
  admin: ["/admin/"],
  president: ["/president/", "/ceo/", "/coo/", "/cfo/", "/cgo/"],
  ceo: ["/ceo/"],
  coo: ["/coo/"],
  cgo: ["/cgo/", "/marketing/"],
  cfo: ["/cfo/", "/finance/"],
  audit: ["/audit/"],
  vp_sales: ["/vp-sales/", "/sales/", "/closer/", "/finder/", "/builder/"],
  vp_marketing: ["/vp-marketing/", "/marketing/"],
  vp_operations: ["/vp-ops/", "/support/", "/hr/"],
  vp_product: ["/vp-product/", "/product/", "/product-manager/"],
  finance: ["/finance/"],
  hr: ["/hr/"],
  marketing: ["/marketing/"],
  sales: ["/sales/"],
  closer: ["/closer/", "/sales/"],
  finder: ["/finder/", "/sales/"],
  builder: ["/builder/", "/sales/"],
  relationship_manager: ["/rm/", "/sales/"],
  support: ["/support/"],
  tech: ["/tech/"],
  tech_team: ["/tech/"],
  product_manager: ["/product-manager/", "/product/"],
  compliance: ["/compliance/"],
  legal_advisor: ["/legal/"],
  therapist: ["/therapist/"],
  clinical_advisor: ["/clinical/"],
  manager: ["/manager/"],
  secretary: ["/secretary/"],
  employee: ["/employee/"],
  ambassador: ["/ambassador/"],
  partner: ["/partner/"],
  health_personnel: ["/health-personnel/"],
  corporate_hr: ["/hr/", "/institutional/"],
  institutional: ["/institutional/"],
  institution_admin: ["/institutional/"],
  university_admin: ["/university/"],
  ngo_admin: ["/ngo/"],
};

export const STAFF_PREFIXES = Array.from(new Set(Object.values(ROLE_ALLOWED_PREFIXES).flat()));

export function getDashboardPathForRole(role: string | null | undefined): string {
  const canonicalRole = normalizeRole(role);
  if (!canonicalRole) return DEFAULT_DASHBOARD;
  return ROLE_DASHBOARD_PATHS[canonicalRole] ?? DEFAULT_DASHBOARD;
}

export function getAllowedPrefixesForRole(role: string | null | undefined): string[] {
  const canonicalRole = normalizeRole(role);
  return canonicalRole ? ROLE_ALLOWED_PREFIXES[canonicalRole] ?? [] : [];
}
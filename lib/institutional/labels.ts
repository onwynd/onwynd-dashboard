type OrgType = "university" | "corporate" | "faith_ngo" | string | null;

const MAP: Record<string, Record<string, string>> = {
  corporate: {
    members: "Employees",
    active: "Active Employees",
    portalTitle: "HR Portal",
    portalIcon: "Building2",
    atRisk: "At-Risk Employees",
    quota: "Quota & Seats",
    hrDashboard: "HR Dashboard",
    hrAnalytics: "HR Analytics",
    hrTeam: "HR Team",
    employeeMembers: "Employee Members",
    atRiskMembers: "At-Risk Members",
    workforceWellness: "Workforce Wellness",
    employer: "Employer",
    benefitsAdmin: "Benefits Admin",
    monthlyBilling: "Monthly billing",
  },
  university: {
    members: "Students",
    active: "Active Students",
    portalTitle: "Student Affairs Portal",
    portalIcon: "GraduationCap",
    atRisk: "At-Risk Students",
    quota: "Quota & Enrolment",
    hrDashboard: "Student Affairs Dashboard",
    hrAnalytics: "Campus Wellness Analytics",
    hrTeam: "Student Affairs Team",
    employeeMembers: "Enrolled Students",
    atRiskMembers: "At-Risk Students",
    workforceWellness: "Campus Mental Health",
    employer: "Institution",
    benefitsAdmin: "Student Affairs Officer",
    monthlyBilling: "Billing (by cycle)",
  },
  faith_ngo: {
    members: "Members",
    active: "Active Members",
    portalTitle: "Organisation Portal",
    portalIcon: "Building2",
    atRisk: "At-Risk Members",
    quota: "Quota & Seats",
    hrDashboard: "Organisation Dashboard",
    hrAnalytics: "Member Wellness Analytics",
    hrTeam: "Organisation Team",
    employeeMembers: "Members",
    atRiskMembers: "At-Risk Members",
    workforceWellness: "Community Mental Health",
    employer: "Organisation",
    benefitsAdmin: "Program Officer",
    monthlyBilling: "Monthly billing",
  },
};

export function getLabel(key: string, orgType: OrgType): string {
  const typeKey =
    orgType === "university" ? "university" : orgType === "faith_ngo" ? "faith_ngo" : "corporate";
  return MAP[typeKey][key] ?? key;
}

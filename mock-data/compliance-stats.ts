
export interface StatCard {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  subtitleIcon: string;
}

export const complianceStats: StatCard[] = [
  {
    id: "compliance-score",
    title: "Compliance Score",
    value: "92%",
    subtitle: "+2% from last month",
    icon: "shield",
    subtitleIcon: "check-circle",
  },
  {
    id: "open-issues",
    title: "Open Issues",
    value: "5",
    subtitle: "2 High Priority",
    icon: "alert-triangle",
    subtitleIcon: "file-text",
  },
  {
    id: "audits-due",
    title: "Audits Due",
    value: "3",
    subtitle: "Next: HIPAA Review",
    icon: "file-text",
    subtitleIcon: "calendar",
  },
];

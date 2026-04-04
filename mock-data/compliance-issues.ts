export interface ComplianceIssue {
  id: string;
  title: string;
  type: "HIPAA" | "GDPR" | "Internal" | "SOC2";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved";
  assignedTo: string;
  dueDate: string;
}

export const complianceIssues: ComplianceIssue[] = [
  {
    id: "ISS-001",
    title: "Missing BAA for new vendor",
    type: "HIPAA",
    severity: "high",
    status: "open",
    assignedTo: "Legal Team",
    dueDate: "2024-07-15",
  },
  {
    id: "ISS-002",
    title: "Quarterly Access Review",
    type: "SOC2",
    severity: "medium",
    status: "in_progress",
    assignedTo: "IT Security",
    dueDate: "2024-07-20",
  },
  {
    id: "ISS-003",
    title: "Cookie Consent Banner Update",
    type: "GDPR",
    severity: "low",
    status: "resolved",
    assignedTo: "Web Team",
    dueDate: "2024-06-30",
  },
  {
    id: "ISS-004",
    title: "Staff Training Completion < 100%",
    type: "Internal",
    severity: "medium",
    status: "open",
    assignedTo: "HR",
    dueDate: "2024-07-30",
  },
  {
    id: "ISS-005",
    title: "Encryption Key Rotation",
    type: "SOC2",
    severity: "high",
    status: "in_progress",
    assignedTo: "DevOps",
    dueDate: "2024-07-10",
  },
];

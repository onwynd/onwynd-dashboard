
export interface LegalCase {
  id: string;
  title: string;
  type: "contract" | "compliance" | "dispute" | "advisory";
  status: "active" | "pending" | "closed" | "review";
  priority: "high" | "medium" | "low";
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  lastUpdated: string;
}

export const legalCases: LegalCase[] = [
  {
    id: "LC-2024-001",
    title: "Vendor Agreement Review - Cloud Services",
    type: "contract",
    status: "review",
    priority: "high",
    assignee: {
      name: "Sarah Jenkins",
      avatar: "https://i.pravatar.cc/150?u=sarah",
    },
    dueDate: "2024-03-25",
    lastUpdated: "2024-03-20",
  },
  {
    id: "LC-2024-002",
    title: "HIPAA Compliance Audit Q1",
    type: "compliance",
    status: "active",
    priority: "high",
    assignee: {
      name: "Michael Ross",
      avatar: "https://i.pravatar.cc/150?u=michael",
    },
    dueDate: "2024-03-30",
    lastUpdated: "2024-03-21",
  },
  {
    id: "LC-2024-003",
    title: "Employee Handbook Update",
    type: "advisory",
    status: "pending",
    priority: "medium",
    assignee: {
      name: "Jessica Pearson",
      avatar: "https://i.pravatar.cc/150?u=jessica",
    },
    dueDate: "2024-04-15",
    lastUpdated: "2024-03-18",
  },
  {
    id: "LC-2024-004",
    title: "Terms of Service Revision",
    type: "contract",
    status: "active",
    priority: "medium",
    assignee: {
      name: "Louis Litt",
      avatar: "https://i.pravatar.cc/150?u=louis",
    },
    dueDate: "2024-04-01",
    lastUpdated: "2024-03-19",
  },
];

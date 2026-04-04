export interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  status: "New" | "Contacted" | "Qualified" | "Lost";
  value: string;
}

export const marketingLeads: Lead[] = [
  {
    id: "LEAD-001",
    name: "John Doe",
    email: "john@example.com",
    source: "Website",
    status: "New",
    value: "$1,200",
  },
  {
    id: "LEAD-002",
    name: "Jane Smith",
    email: "jane@company.com",
    source: "LinkedIn",
    status: "Qualified",
    value: "$3,500",
  },
  {
    id: "LEAD-003",
    name: "Bob Johnson",
    email: "bob@startup.io",
    source: "Referral",
    status: "Contacted",
    value: "$800",
  },
  {
    id: "LEAD-004",
    name: "Alice Brown",
    email: "alice@enterprise.com",
    source: "Webinar",
    status: "Lost",
    value: "$12,000",
  },
];

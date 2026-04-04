export interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "critical" | "major" | "minor";
  createdAt: string;
  updatedAt: string;
}

export const techIncidents: Incident[] = [
  {
    id: "INC-1234",
    title: "API Latency Spike in EU Region",
    status: "investigating",
    severity: "major",
    createdAt: "2024-03-20T10:30:00Z",
    updatedAt: "2024-03-20T11:15:00Z",
  },
  {
    id: "INC-1233",
    title: "Database Connection Pool Exhaustion",
    status: "monitoring",
    severity: "critical",
    createdAt: "2024-03-19T14:20:00Z",
    updatedAt: "2024-03-19T16:45:00Z",
  },
  {
    id: "INC-1232",
    title: "Third-party Payment Gateway Errors",
    status: "resolved",
    severity: "major",
    createdAt: "2024-03-18T09:15:00Z",
    updatedAt: "2024-03-18T10:30:00Z",
  },
  {
    id: "INC-1231",
    title: "Email Delivery Delays",
    status: "resolved",
    severity: "minor",
    createdAt: "2024-03-17T13:00:00Z",
    updatedAt: "2024-03-17T15:20:00Z",
  },
];

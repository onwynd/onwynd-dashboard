export interface SupportTicket {
  id: string;
  subject: string;
  requester: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: "technical" | "billing" | "account" | "feature_request" | "other";
  createdAt: string;
  lastUpdated: string;
  assignedTo?: string;
}

export const supportTickets: SupportTicket[] = [
  {
    id: "TKT-1024",
    subject: "Unable to reset password",
    requester: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      avatar: "/avatars/01.png",
    },
    status: "open",
    priority: "high",
    category: "account",
    createdAt: "2024-03-20T10:30:00Z",
    lastUpdated: "2024-03-20T10:45:00Z",
    assignedTo: "Support Agent 1",
  },
  {
    id: "TKT-1023",
    subject: "Billing invoice incorrect",
    requester: {
      name: "Michael Chen",
      email: "m.chen@example.com",
      avatar: "/avatars/02.png",
    },
    status: "pending",
    priority: "medium",
    category: "billing",
    createdAt: "2024-03-19T14:20:00Z",
    lastUpdated: "2024-03-20T09:15:00Z",
    assignedTo: "Support Agent 2",
  },
  {
    id: "TKT-1022",
    subject: "Feature request: Dark mode",
    requester: {
      name: "Emily Davis",
      email: "emily.d@example.com",
      avatar: "/avatars/03.png",
    },
    status: "open",
    priority: "low",
    category: "feature_request",
    createdAt: "2024-03-19T11:00:00Z",
    lastUpdated: "2024-03-19T11:00:00Z",
  },
  {
    id: "TKT-1021",
    subject: "App crashes on login",
    requester: {
      name: "David Wilson",
      email: "david.w@example.com",
      avatar: "/avatars/04.png",
    },
    status: "resolved",
    priority: "urgent",
    category: "technical",
    createdAt: "2024-03-18T09:30:00Z",
    lastUpdated: "2024-03-18T16:45:00Z",
    assignedTo: "Support Agent 1",
  },
  {
    id: "TKT-1020",
    subject: "How to update profile picture?",
    requester: {
      name: "Lisa Brown",
      email: "lisa.b@example.com",
      avatar: "/avatars/05.png",
    },
    status: "closed",
    priority: "low",
    category: "account",
    createdAt: "2024-03-18T08:15:00Z",
    lastUpdated: "2024-03-18T10:30:00Z",
    assignedTo: "Support Agent 3",
  },
];

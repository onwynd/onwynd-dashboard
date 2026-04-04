export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  status: "completed" | "pending" | "failed";
  category: string;
  date: string;
  merchant?: string;
}

export const financeTransactions: Transaction[] = [
  {
    id: "TRX-9871",
    description: "Therapy Session - Premium",
    amount: 150.00,
    type: "income",
    status: "completed",
    category: "Services",
    date: "2024-03-20T14:30:00Z",
    merchant: "Stripe",
  },
  {
    id: "TRX-9872",
    description: "Server Costs (AWS)",
    amount: 450.00,
    type: "expense",
    status: "completed",
    category: "Infrastructure",
    date: "2024-03-19T10:00:00Z",
    merchant: "Amazon Web Services",
  },
  {
    id: "TRX-9873",
    description: "Consultation Fee",
    amount: 80.00,
    type: "income",
    status: "pending",
    category: "Services",
    date: "2024-03-19T09:15:00Z",
    merchant: "PayPal",
  },
  {
    id: "TRX-9874",
    description: "Software License (Zoom)",
    amount: 14.99,
    type: "expense",
    status: "completed",
    category: "Software",
    date: "2024-03-18T16:20:00Z",
    merchant: "Zoom Video Communications",
  },
  {
    id: "TRX-9875",
    description: "Corporate Plan Subscription",
    amount: 2500.00,
    type: "income",
    status: "completed",
    category: "Subscriptions",
    date: "2024-03-18T11:45:00Z",
    merchant: "Bank Transfer",
  },
];

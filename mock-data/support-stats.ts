import { Ticket, Clock, CheckCircle, AlertCircle } from "lucide-react";

export const supportStats = [
  {
    title: "Open Tickets",
    value: "24",
    change: "+4",
    changeType: "increase",
    icon: Ticket,
    description: "Active support requests",
  },
  {
    title: "Avg Response Time",
    value: "1.5h",
    change: "-15m",
    changeType: "decrease",
    icon: Clock,
    description: "Average time to first response",
  },
  {
    title: "Resolved Today",
    value: "18",
    change: "+2",
    changeType: "increase",
    icon: CheckCircle,
    description: "Tickets closed today",
  },
  {
    title: "Escalated",
    value: "3",
    change: "0",
    changeType: "neutral",
    icon: AlertCircle,
    description: "Tickets requiring higher tier support",
  },
];

import { Target, Users, CheckSquare, Zap } from "lucide-react";

export const pmStats = [
  {
    title: "Active Sprints",
    value: "3",
    change: "On track",
    changeType: "increase",
    icon: Zap,
    description: "Current development cycles",
  },
  {
    title: "Backlog Items",
    value: "45",
    change: "+12",
    changeType: "neutral",
    icon: CheckSquare,
    description: "Pending tasks",
  },
  {
    title: "Team Velocity",
    value: "24",
    change: "+15%",
    changeType: "increase",
    icon: Target,
    description: "Story points per sprint",
  },
  {
    title: "Active Users",
    value: "1.2k",
    change: "+8.5%",
    changeType: "increase",
    icon: Users,
    description: "Daily active users",
  },
];

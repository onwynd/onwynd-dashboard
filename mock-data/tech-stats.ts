export interface TechStat {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: "activity" | "server" | "alert-triangle" | "clock";
}

export const techStats: TechStat[] = [
  {
    id: "1",
    title: "System Uptime",
    value: "99.98%",
    change: "+0.02%",
    isPositive: true,
    icon: "activity",
  },
  {
    id: "2",
    title: "Active Servers",
    value: "24/24",
    change: "All Operational",
    isPositive: true,
    icon: "server",
  },
  {
    id: "3",
    title: "Open Incidents",
    value: "3",
    change: "-2 from yesterday",
    isPositive: true,
    icon: "alert-triangle",
  },
  {
    id: "4",
    title: "Avg Response Time",
    value: "124ms",
    change: "-15ms",
    isPositive: true,
    icon: "clock",
  },
];

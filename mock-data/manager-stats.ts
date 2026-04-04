
export interface StatCard {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  subtitleIcon: string;
}

export const managerStats: StatCard[] = [
  {
    id: "total-employees",
    title: "Total Employees",
    value: "150",
    subtitle: "Active: 140, Inactive: 10",
    icon: "users",
    subtitleIcon: "file",
  },
  {
    id: "payroll",
    title: "Upcoming Payroll",
    value: "$250,000",
    subtitle: "Processing in 3 days",
    icon: "file-text",
    subtitleIcon: "file",
  },
  {
    id: "attendance",
    title: "Attendance Rate",
    value: "85%",
    subtitle: "Last 30 Days",
    icon: "calendar",
    subtitleIcon: "info",
  },
];

export type EmployeeStat = {
  id: string;
  title: string;
  value: string;
  icon: string;
};

export const employeeStats: EmployeeStat[] = [
  {
    id: "1",
    title: "Assigned Tasks",
    value: "12",
    icon: "clipboard",
  },
  {
    id: "2",
    title: "Pending Reviews",
    value: "3",
    icon: "file-text",
  },
  {
    id: "3",
    title: "Hours Logged",
    value: "38.5",
    icon: "clock",
  },
  {
    id: "4",
    title: "Leave Balance",
    value: "14 Days",
    icon: "calendar",
  },
];

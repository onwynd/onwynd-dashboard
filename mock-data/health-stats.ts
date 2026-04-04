
export interface StatCard {
  id: string;
  title: string;
  value: string;
  icon: string;
  change?: string;
}

export const mockHealthStats: StatCard[] = [
  {
    id: "waiting",
    title: "Patients Waiting",
    value: "12",
    icon: "users",
    change: "+4 since last hour",
  },
  {
    id: "checked-in",
    title: "Checked In Today",
    value: "45",
    icon: "check-circle",
    change: "+12% vs yesterday",
  },
  {
    id: "appointments",
    title: "Appointments",
    value: "86",
    icon: "calendar",
    change: "Fully booked",
  },
  {
    id: "doctors",
    title: "Doctors Available",
    value: "8/10",
    icon: "activity",
    change: "2 on break",
  },
];

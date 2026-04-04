export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "Active" | "On Leave" | "Probation" | "Inactive";
  joinDate: string;
  avatar: string;
}

export const employees: Employee[] = [
  {
    id: "EMP-001",
    name: "Sarah Johnson",
    email: "sarah.j@onwynd.com",
    role: "Senior Therapist",
    department: "Clinical",
    status: "Active",
    joinDate: "2023-01-15",
    avatar: "/avatars/01.png",
  },
  {
    id: "EMP-002",
    name: "Michael Chen",
    email: "m.chen@onwynd.com",
    role: "Clinical Director",
    department: "Clinical",
    status: "Active",
    joinDate: "2022-11-01",
    avatar: "/avatars/02.png",
  },
  {
    id: "EMP-003",
    name: "Jessica Williams",
    email: "j.williams@onwynd.com",
    role: "HR Manager",
    department: "Human Resources",
    status: "Active",
    joinDate: "2023-03-10",
    avatar: "/avatars/03.png",
  },
  {
    id: "EMP-004",
    name: "David Miller",
    email: "d.miller@onwynd.com",
    role: "Software Engineer",
    department: "Technology",
    status: "On Leave",
    joinDate: "2023-02-20",
    avatar: "/avatars/04.png",
  },
  {
    id: "EMP-005",
    name: "Emily Davis",
    email: "e.davis@onwynd.com",
    role: "Marketing Specialist",
    department: "Marketing",
    status: "Active",
    joinDate: "2023-04-05",
    avatar: "/avatars/05.png",
  },
  {
    id: "EMP-006",
    name: "James Wilson",
    email: "j.wilson@onwynd.com",
    role: "Accountant",
    department: "Finance",
    status: "Probation",
    joinDate: "2023-06-01",
    avatar: "/avatars/06.png",
  },
  {
    id: "EMP-007",
    name: "Robert Taylor",
    email: "r.taylor@onwynd.com",
    role: "Sales Representative",
    department: "Sales",
    status: "Active",
    joinDate: "2023-05-15",
    avatar: "/avatars/07.png",
  },
  {
    id: "EMP-008",
    name: "Lisa Anderson",
    email: "l.anderson@onwynd.com",
    role: "Customer Support",
    department: "Support",
    status: "Inactive",
    joinDate: "2023-01-20",
    avatar: "/avatars/08.png",
  },
];

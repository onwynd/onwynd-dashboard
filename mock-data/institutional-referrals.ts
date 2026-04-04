export type Referral = {
  id: string;
  patientName: string;
  program: string;
  status: "Active" | "Pending" | "Completed" | "Discharged";
  date: string;
  doctor: string;
  avatar: string;
};

export const institutionalReferrals: Referral[] = [
  {
    id: "1",
    patientName: "John Doe",
    program: "Mental Health Support",
    status: "Active",
    date: "2024-03-01",
    doctor: "Dr. Smith",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=john",
  },
  {
    id: "2",
    patientName: "Jane Smith",
    program: "Physical Therapy",
    status: "Active",
    date: "2024-02-28",
    doctor: "Dr. Jones",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=jane",
  },
  {
    id: "3",
    patientName: "Robert Brown",
    program: "Cardiology Rehab",
    status: "Pending",
    date: "2024-03-05",
    doctor: "Dr. Williams",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=robert",
  },
  {
    id: "4",
    patientName: "Emily Davis",
    program: "Nutrition Plan",
    status: "Completed",
    date: "2024-01-15",
    doctor: "Dr. Taylor",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=emily",
  },
  {
    id: "5",
    patientName: "Michael Wilson",
    program: "Mental Health Support",
    status: "Discharged",
    date: "2023-12-10",
    doctor: "Dr. Smith",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=michael",
  },
];

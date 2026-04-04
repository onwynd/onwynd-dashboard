export interface CheckIn {
  id: string;
  patientId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  checkInTime: string;
  appointmentTime: string;
  doctorName: string;
  status: "waiting" | "in-session" | "completed" | "cancelled";
  reason: string;
}

export const mockCheckIns: CheckIn[] = [
  {
    id: "1",
    patientId: "P-1001",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "/avatars/01.png",
    checkInTime: "08:45 AM",
    appointmentTime: "09:00 AM",
    doctorName: "Dr. Smith",
    status: "in-session",
    reason: "Routine Checkup",
  },
  {
    id: "2",
    patientId: "P-1002",
    name: "Bob Williams",
    email: "bob.w@example.com",
    phone: "+1 (555) 234-5678",
    avatar: "/avatars/02.png",
    checkInTime: "09:15 AM",
    appointmentTime: "09:30 AM",
    doctorName: "Dr. Jones",
    status: "waiting",
    reason: "Therapy Session",
  },
  {
    id: "3",
    patientId: "P-1003",
    name: "Charlie Brown",
    email: "charlie.b@example.com",
    phone: "+1 (555) 345-6789",
    avatar: "/avatars/03.png",
    checkInTime: "09:20 AM",
    appointmentTime: "09:45 AM",
    doctorName: "Dr. Smith",
    status: "waiting",
    reason: "Follow-up",
  },
  {
    id: "4",
    patientId: "P-1004",
    name: "Diana Prince",
    email: "diana.p@example.com",
    phone: "+1 (555) 456-7890",
    avatar: "/avatars/04.png",
    checkInTime: "08:00 AM",
    appointmentTime: "08:30 AM",
    doctorName: "Dr. Jones",
    status: "completed",
    reason: "Consultation",
  },
  {
    id: "5",
    patientId: "P-1005",
    name: "Evan Wright",
    email: "evan.w@example.com",
    phone: "+1 (555) 567-8901",
    avatar: "/avatars/05.png",
    checkInTime: "09:50 AM",
    appointmentTime: "10:00 AM",
    doctorName: "Dr. Smith",
    status: "waiting",
    reason: "New Patient Intake",
  },
];

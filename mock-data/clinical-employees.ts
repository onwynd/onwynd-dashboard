export interface Patient {
  id: string;
  userId: string;
  name: string;
  email: string;
  department: "General" | "Mental Health" | "Physical Therapy" | "Nutrition" | "Cardiology";
  jobTitle: string;
  joinedDate: string;
  status: "Active" | "Discharged" | "Monitoring" | "Critical";
  avatar?: string;
}

const departments: Patient["department"][] = ["General", "Mental Health", "Physical Therapy", "Nutrition", "Cardiology"];
const statuses: Patient["status"][] = ["Active", "Discharged", "Monitoring", "Critical"];

const jobTitles: Record<Patient["department"], string[]> = {
  General: ["Checkup", "Consultation", "Follow-up", "Screening"],
  "Mental Health": ["Therapy", "Counseling", "Assessment", "Support Group"],
  "Physical Therapy": ["Rehab", "Exercise", "Massage", "Assessment"],
  Nutrition: ["Diet Plan", "Consultation", "Assessment", "Follow-up"],
  Cardiology: ["ECG", "Checkup", "Stress Test", "Consultation"],
};

const firstNames = [
  "John", "Jane", "Alex", "Emily", "Michael", "Sarah", "Daniel", "Olivia",
  "James", "Emma", "William", "Sophia", "Benjamin", "Isabella", "Lucas",
  "Mia", "Henry", "Charlotte", "Alexander", "Amelia", "Sebastian", "Harper",
  "Jack", "Evelyn", "Owen", "Abigail", "Theodore", "Ella", "Aiden", "Scarlett",
  "Samuel", "Grace", "Joseph", "Chloe", "David", "Victoria", "Matthew", "Riley",
  "Jackson", "Aria", "Ethan", "Lily", "Noah", "Hannah", "Logan", "Zoe",
  "Ryan", "Nora", "Nathan", "Mila"
];

const lastNames = [
  "Doe", "Smith", "Johnson", "Davis", "Brown", "Wilson", "Lee", "Clark",
  "Miller", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White",
  "Harris", "Martin", "Garcia", "Martinez", "Robinson", "Lewis", "Walker",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill",
  "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter",
  "Roberts", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards",
  "Collins", "Reyes", "Stewart", "Morris"
];

const dates = [
  "01 Jan 2024", "12 Feb 2024", "05 Mar 2024", "18 Apr 2024", "22 May 2024",
  "09 Jun 2024", "14 Jul 2024", "28 Aug 2024", "03 Sep 2024", "17 Oct 2024",
  "25 Nov 2024", "08 Dec 2024", "15 Jan 2025", "20 Feb 2025", "10 Mar 2025",
  "02 Apr 2025", "19 May 2025", "06 Jun 2025", "23 Jul 2025", "11 Aug 2025",
  "04 Sep 2025", "27 Oct 2025", "13 Nov 2025", "30 Dec 2025", "07 Jan 2024",
  "16 Feb 2024", "21 Mar 2024", "08 Apr 2024", "29 May 2024", "12 Jun 2024",
  "01 Jul 2024", "19 Aug 2024", "26 Sep 2024", "10 Oct 2024", "03 Nov 2024",
  "22 Dec 2024", "09 Jan 2025", "14 Feb 2025", "28 Mar 2025", "05 Apr 2025",
  "17 May 2025", "24 Jun 2025", "02 Jul 2025", "15 Aug 2025", "20 Sep 2025",
  "08 Oct 2025", "25 Nov 2025", "12 Dec 2025", "18 Jan 2024", "06 Feb 2024"
];

export const patients: Patient[] = Array.from({ length: 50 }, (_, i) => {
  const department = departments[Math.floor(Math.random() * departments.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const jobTitleList = jobTitles[department];
  const jobTitle = jobTitleList[Math.floor(Math.random() * jobTitleList.length)];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
  
  return {
    id: `PAT-${1000 + i}`,
    userId: `#${2024001 + i}`,
    name,
    email,
    department,
    jobTitle,
    joinedDate: dates[Math.floor(Math.random() * dates.length)],
    status,
    avatar: `/placeholder.svg?height=32&width=32`,
  };
});

export const financialFlowData = [
  { month: "Jan", moneyIn: 180000, moneyOut: 120000 },
  { month: "Feb", moneyIn: 200000, moneyOut: 140000 },
  { month: "Mar", moneyIn: 220000, moneyOut: 150000 },
  { month: "Apr", moneyIn: 280000, moneyOut: 175000 },
  { month: "May", moneyIn: 250000, moneyOut: 160000 },
  { month: "Jun", moneyIn: 230000, moneyOut: 145000 },
  { month: "Jul", moneyIn: 210000, moneyOut: 130000 },
  { month: "Aug", moneyIn: 240000, moneyOut: 155000 },
  { month: "Sep", moneyIn: 260000, moneyOut: 165000 },
  { month: "Oct", moneyIn: 275000, moneyOut: 170000 },
  { month: "Nov", moneyIn: 290000, moneyOut: 180000 },
  { month: "Dec", moneyIn: 310000, moneyOut: 190000 },
];


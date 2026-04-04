export type EmployeeDocument = {
  id: string;
  name: string;
  size: string;
  category: string;
  uploadedAt: string;
  icon: string;
};

export const employeeDocuments: EmployeeDocument[] = [
  {
    id: "1",
    name: "Employee Handbook 2024",
    size: "2.4mb",
    category: "Policy",
    uploadedAt: "Jan 15, 2024",
    icon: "book",
  },
  {
    id: "2",
    name: "IT Security Policy",
    size: "1.1mb",
    category: "Policy",
    uploadedAt: "Feb 10, 2024",
    icon: "shield",
  },
  {
    id: "3",
    name: "Payslip - January",
    size: "150kb",
    category: "Finance",
    uploadedAt: "Jan 31, 2024",
    icon: "file-text",
  },
  {
    id: "4",
    name: "Expense Report Template",
    size: "45kb",
    category: "Finance",
    uploadedAt: "Mar 01, 2024",
    icon: "file-spreadsheet",
  },
  {
    id: "5",
    name: "Holiday Calendar 2024",
    size: "800kb",
    category: "General",
    uploadedAt: "Jan 01, 2024",
    icon: "calendar",
  },
];

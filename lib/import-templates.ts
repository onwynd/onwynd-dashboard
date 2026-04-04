export type ImportTemplate = {
  name: string;
  filename: string;
  headers: string[];
  sampleData: string[][];
  description: string;
};

export const importTemplates: Record<string, ImportTemplate> = {
  users: {
    name: "Users",
    filename: "users_import_template.csv",
    headers: ["name", "email", "password", "role", "is_active"],
    sampleData: [
      ["John Doe", "john@example.com", "securepassword123", "user", "true"],
      ["Jane Smith", "jane@example.com", "securepassword456", "user", "true"],
      ["Admin User", "admin@example.com", "adminpassword789", "admin", "true"],
    ],
    description: "Import users with name, email, password, role (user/admin/manager/therapist/institution), and active status (true/false)"
  },
  institutions: {
    name: "Institutions",
    filename: "institutions_import_template.csv",
    headers: ["name", "email", "password", "description", "is_active"],
    sampleData: [
      ["Therapy Center A", "contact@therapycenter.com", "securepassword123", "Mental health therapy center", "true"],
      ["Wellness Institute", "info@wellness.com", "securepassword456", "Holistic wellness center", "true"],
    ],
    description: "Import institutions with name, email, password, description, and active status (true/false)"
  },
  therapists: {
    name: "Therapists",
    filename: "therapists_import_template.csv",
    headers: ["name", "email", "password", "specialization", "is_active"],
    sampleData: [
      ["Dr. Sarah Johnson", "sarah@therapy.com", "securepassword123", "Cognitive Behavioral Therapy", "true"],
      ["Michael Chen, LMFT", "michael@counseling.com", "securepassword456", "Family Therapy", "true"],
    ],
    description: "Import therapists with name, email, password, specialization, and active status (true/false)"
  },
  courses: {
    name: "Courses",
    filename: "courses_import_template.csv",
    headers: ["title", "description", "level", "duration_minutes", "is_published"],
    sampleData: [
      ["Introduction to Mindfulness", "Learn basic mindfulness techniques", "beginner", "60", "true"],
      ["Advanced CBT Techniques", "Advanced cognitive behavioral therapy", "advanced", "120", "false"],
      ["Stress Management", "Techniques for managing daily stress", "intermediate", "90", "true"],
    ],
    description: "Import courses with title, description, level (beginner/intermediate/advanced), duration in minutes, and published status (true/false)"
  },
  subscriptions: {
    name: "Subscription Plans",
    filename: "subscriptions_import_template.csv",
    headers: ["name", "description", "price", "billing_cycle", "features", "is_active"],
    sampleData: [
      ["Basic Plan", "Basic subscription with essential features", "29.99", "monthly", "Basic access,Email support", "true"],
      ["Premium Plan", "Premium subscription with all features", "99.99", "monthly", "Full access,Priority support,Advanced analytics", "true"],
      ["Annual Plan", "Annual subscription with discount", "999.99", "yearly", "Full access,Priority support,Advanced analytics,Annual discount", "true"],
    ],
    description: "Import subscription plans with name, description, price, billing cycle (monthly/yearly), features (comma-separated), and active status (true/false)"
  }
};

export function downloadImportTemplate(templateKey: string): void {
  const template = importTemplates[templateKey];
  if (!template) {
    throw new Error(`Template ${templateKey} not found`);
  }

  const lines: string[] = [];
  
  // Add description as a comment
  lines.push(`# ${template.description}`);
  lines.push(`# ${template.name} Import Template`);
  lines.push(`# Generated on: ${new Date().toISOString()}`);
  lines.push('');
  
  // Add headers
  lines.push(template.headers.join(','));
  
  // Add sample data
  template.sampleData.forEach(row => {
    lines.push(row.map(value => {
      // Escape values that contain commas or quotes
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','));
  });

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = template.filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getImportTemplateKeys(): string[] {
  return Object.keys(importTemplates);
}

export function getImportTemplate(templateKey: string): ImportTemplate {
  const template = importTemplates[templateKey];
  if (!template) {
    throw new Error(`Template ${templateKey} not found`);
  }
  return template;
}
import { OkrPageContent } from "@/components/okr/OkrPageContent";

export default function PresidentOkrPage() {
  return (
    <OkrPageContent
      okrHref="/president/okr"
      allowedRoles={["president", "super_admin", "founder"]}
      manageRoles={["president", "super_admin", "founder"]}
      execRoles={["president", "super_admin", "founder"]}
    />
  );
}


// filepath: components/therapist-dashboard/onboarding-wizard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingWizardProps {
  completedSteps: string[];
  onStepComplete: (step: string) => void;
}

const steps = [
  { id: "profile", title: "Complete Your Profile", description: "Add your specialization, bio, and a profile photo." },
  { id: "availability", title: "Set Your Availability", description: "Let patients know when you are available for sessions." },
  { id: "bank_details", title: "Add Bank Details", description: "Securely add your bank account for payouts." },
  { id: "certificate", title: "Upload Certificate", description: "Verify your credentials by uploading your certificate." },
];

export function OnboardingWizard({ completedSteps, onStepComplete }: OnboardingWizardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Onwynd! Let's get you set up.</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          return (
            <div key={step.id} className="flex items-start gap-4 p-4 rounded-lg border">
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {!isCompleted && (
                <Button size="sm" onClick={() => onStepComplete(step.id)}>Mark as Done</Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

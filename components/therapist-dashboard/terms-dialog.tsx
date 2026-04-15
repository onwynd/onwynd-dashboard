
// filepath: components/therapist-dashboard/terms-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export function TermsDialog({ open, onOpenChange, onAccept }: TermsDialogProps) {
  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Terms of Service Update</DialogTitle>
          <DialogDescription>
            Please review and accept our updated terms of service to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="prose prose-sm max-h-[400px] overflow-y-auto p-1">
          <h4>1. Introduction</h4>
          <p>Welcome to Onwynd. By using our platform, you agree to these terms.</p>
          <h4>2. Services</h4>
          <p>We provide a platform to connect therapists with patients. We are not a healthcare provider.</p>
          <h4>3. Data Privacy</h4>
          <p>We are committed to protecting your data. Please see our Privacy Policy for details.</p>
          {/* Add more terms content here */}
        </div>
        <DialogFooter>
          <Button onClick={handleAccept}>I Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

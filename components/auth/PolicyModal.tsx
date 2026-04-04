"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export type PolicyType = "terms" | "privacy";

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: PolicyType;
}

export function PolicyModal({ isOpen, onClose, type }: PolicyModalProps) {
  const title = type === "terms" ? "Terms of Service" : "Privacy Policy";
  const src = type === "terms" ? "/terms" : "/privacy";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-[32px]">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <iframe
          src={src}
          title={title}
          className="w-full border-0"
          style={{ height: "75vh" }}
          sandbox="allow-same-origin allow-scripts"
        />
      </DialogContent>
    </Dialog>
  );
}

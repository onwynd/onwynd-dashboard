"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog as BaseDialog,
  DialogTrigger as BaseDialogTrigger,
  DialogContent as BaseDialogContent,
  DialogHeader as BaseDialogHeader,
  DialogTitle as BaseDialogTitle,
  DialogDescription as BaseDialogDescription,
  DialogFooter as BaseDialogFooter,
} from "@/components/ui/dialog";

const AlertDialog = BaseDialog;
const AlertDialogTrigger = BaseDialogTrigger;
const AlertDialogContent = BaseDialogContent as unknown as React.ComponentType<React.ComponentProps<typeof BaseDialogContent>>;
const AlertDialogHeader = BaseDialogHeader;
const AlertDialogTitle = BaseDialogTitle;
const AlertDialogDescription = BaseDialogDescription;
const AlertDialogFooter = BaseDialogFooter;

const AlertDialogAction = ({ className, ...props }: React.ComponentProps<typeof Button>) => {
  return <Button className={className} {...props} />;
};

const AlertDialogCancel = ({ className, ...props }: React.ComponentProps<typeof Button>) => {
  return <Button variant="outline" className={className} {...props} />;
};

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
};


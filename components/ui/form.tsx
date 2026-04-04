"use client";

import * as React from "react";
import {
  Controller,
  FormProvider,
  type UseFormReturn,
  type FieldValues,
  type Control,
  type FieldPath,
  type ControllerRenderProps,
  type ControllerFieldState,
  type UseFormStateReturn,
} from "react-hook-form";
import { cn } from "@/lib/utils";

export function Form<TFieldValues extends FieldValues>({ children, ...form }: { children: React.ReactNode } & UseFormReturn<TFieldValues>) {
  return <FormProvider {...form}>{children}</FormProvider>;
}

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  render,
}: {
  control: Control<TFieldValues>;
  name: TName;
  render: (props: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactNode;
}) {
  return (
    <Controller<TFieldValues, TName>
      control={control}
      name={name}
      render={({ field, fieldState, formState }) => render({ field, fieldState, formState }) as React.ReactElement}
    />
  );
}

export function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function FormLabel({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}

export function FormControl({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}

export function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-xs text-destructive", className)} {...props}>
      {children}
    </p>
  );
}

export function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

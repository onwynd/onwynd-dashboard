import { cn } from "@/lib/utils";

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({ value, onValueChange, children, className }: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      data-value={value}
      className={cn("grid gap-2", className)}
      onChange={(e) => {
        const target = e.target as HTMLInputElement;
        if (target.type === "radio") onValueChange?.(target.value);
      }}
    >
      {children}
    </div>
  );
}

interface RadioGroupItemProps {
  value: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export function RadioGroupItem({ value, id, className, disabled }: RadioGroupItemProps) {
  return (
    <input
      type="radio"
      value={value}
      id={id}
      disabled={disabled}
      className={cn(
        "h-4 w-4 rounded-full border border-gray-300 text-teal accent-teal cursor-pointer",
        className
      )}
    />
  );
}

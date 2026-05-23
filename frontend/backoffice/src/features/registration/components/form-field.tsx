import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
  hint?: string;
}

export function FormField({
  label,
  error,
  className,
  children,
  hint,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
      {hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}

import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegistrationStageProps {
  title: string;
  completed: boolean;
  active: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

export function RegistrationStage({
  title,
  completed,
  active,
  onSelect,
  children,
}: RegistrationStageProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-colors",
        active ? "border-primary/40 shadow-sm" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-full text-sm font-medium",
              completed
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {completed ? <Check className="size-4" /> : null}
          </span>
          <span className="font-medium">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            active && "rotate-180",
          )}
        />
      </button>
      {active ? <div className="border-t px-4 py-4">{children}</div> : null}
    </div>
  );
}

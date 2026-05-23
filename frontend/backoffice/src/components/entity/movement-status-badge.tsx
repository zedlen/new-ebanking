import { Badge } from "@/components/ui/badge";
import { MOVEMENT_STATUS_LABELS } from "@/types/movements";

const VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  sent: "default",
  applied: "default",
  scattered: "default",
  pending: "secondary",
  in_transit: "secondary",
  canceled: "destructive",
  stoped: "destructive",
  returned: "outline",
  created: "outline",
};

export function MovementStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={VARIANT[status] ?? "outline"}>
      {MOVEMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

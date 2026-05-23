import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/format";
import { EntityStatus } from "@/types/partners";

const VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  [EntityStatus.Approved]: "default",
  [EntityStatus.Process]: "secondary",
  [EntityStatus.Rejected]: "destructive",
  [EntityStatus.Created]: "outline",
};

interface EntityStatusBadgeProps {
  status: string;
}

export function EntityStatusBadge({ status }: EntityStatusBadgeProps) {
  return (
    <Badge variant={VARIANTS[status] ?? "outline"}>
      {getStatusLabel(status)}
    </Badge>
  );
}

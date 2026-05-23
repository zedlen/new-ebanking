import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { MovementStatusBadge } from "@/components/entity/movement-status-badge";
import {
  downloadMovementVoucher,
  fetchMovementDetail,
} from "@/features/movements/movements-api";
import {
  formatCurrency,
  formatDateTime,
} from "@/lib/format";
import {
  TRANSACTION_TYPE_LABELS,
  type MovementContext,
} from "@/types/movements";

interface MovementDetailSheetProps {
  open: boolean;
  movId: string | null;
  ctx: MovementContext;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value ?? "—"}</span>
    </div>
  );
}

export function MovementDetailSheet({
  open,
  movId,
  ctx,
  onClose,
}: MovementDetailSheetProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["movement", movId, ctx],
    queryFn: () => fetchMovementDetail(ctx, movId!),
    enabled: open && Boolean(movId),
  });

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Detalle de transacción</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <Skeleton className="mt-6 h-48 w-full" />
        ) : data ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm">{data.external_id}</p>
              <MovementStatusBadge status={data.status} />
            </div>
            <Row label="Monto" value={formatCurrency(data.amount)} />
            <Row
              label="Tipo"
              value={TRANSACTION_TYPE_LABELS[data.type] ?? String(data.type)}
            />
            <Row label="Fecha operación" value={formatDateTime(data.operation_date)} />
            <Row label="Referencia" value={String(data.reference ?? "—")} />
            <Row label="Seguimiento" value={data.tracking_key ?? data.folio} />
            <Row label="Concepto" value={data.payment_purpose} />
            <Row label="Ordenante" value={data.payer_name} />
            <Row label="Cuenta ordenante" value={data.payer_account} />
            <Row label="Beneficiario" value={data.beneficiary_name} />
            <Row label="Cuenta beneficiario" value={data.beneficiary_account} />

            <Button
              className="w-full"
              variant="outline"
              onClick={() => movId && downloadMovementVoucher(ctx, movId)}
            >
              <Download className="mr-2 size-4" />
              Descargar comprobante
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground mt-6 text-sm">
            No se pudo cargar el detalle
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}

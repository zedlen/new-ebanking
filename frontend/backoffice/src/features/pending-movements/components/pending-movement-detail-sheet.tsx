import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchPendingMovementDetail } from "@/features/pending-movements/pending-movements-api";
import { formatCurrency } from "@/lib/format";
import { TRANSACTION_TYPE_LABELS } from "@/types/movements";

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value ?? "—"}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold">{title}</h4>
      <div className="rounded-lg border p-3">{children}</div>
    </div>
  );
}

interface PendingMovementDetailSheetProps {
  open: boolean;
  movId: string | null;
  onClose: () => void;
}

export function PendingMovementDetailSheet({
  open,
  movId,
  onClose,
}: PendingMovementDetailSheetProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["pending-movement", movId],
    queryFn: () => fetchPendingMovementDetail(movId!),
    enabled: open && Boolean(movId),
  });

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Aprobar movimiento</SheetTitle>
        </SheetHeader>

        <Alert className="mt-4 border-amber-300 bg-amber-50 text-amber-950">
          <AlertTriangle className="text-amber-700" />
          <AlertTitle>Datos de demostración</AlertTitle>
          <AlertDescription>
            API pendiente — la aprobación y rechazo no están conectados al
            backend.
          </AlertDescription>
        </Alert>

        {isLoading ? (
          <Skeleton className="mt-6 h-48 w-full" />
        ) : data ? (
          <div className="mt-6 space-y-6">
            <Section title="Resumen de movimiento">
              <Row label="Monto" value={formatCurrency(data.amount)} />
              <Row label="Referencia" value={String(data.reference ?? "")} />
              <Row
                label="Tipo"
                value={
                  data.amount > 0
                    ? "Incremento"
                    : "Decremento"
                }
              />
              <Row label="Clave rastreo" value={data.tracking_key} />
              <Row label="Concepto" value={data.payment_purpose} />
            </Section>

            <Section title="Ordenante">
              <Row label="Nombre" value={data.payer_name} />
              <Row label="RFC" value={data.payer_rfc} />
              <Row label="Cuenta" value={data.payer_account} />
              <Row
                label="Método pago"
                value={TRANSACTION_TYPE_LABELS[data.type]}
              />
              <Row label="Institución" value={data.origin_bank_id} />
            </Section>

            <Section title="Beneficiario">
              <Row label="Nombre" value={data.beneficiary_name} />
              <Row label="RFC" value={data.beneficiary_rfc} />
              <Row
                label="Método pago"
                value={TRANSACTION_TYPE_LABELS[data.type]}
              />
              <Row label="Cuenta" value={data.beneficiary_account} />
              <Row label="Institución" value={data.destination_bank_id} />
            </Section>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" className="sm:flex-1" disabled>
                Rechazar
              </Button>
              <Button className="sm:flex-1" disabled>
                Aprobar
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

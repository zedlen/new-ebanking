import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ProspectDocumentsTable } from "@/features/prospects/components/prospect-documents-table";
import { ProspectKycSection } from "@/features/prospects/components/prospect-kyc-section";
import {
  approveProspect,
  fetchProspect,
  rejectProspect,
} from "@/features/onboarding/onboarding-api";
import { canApproveProspect, PROSPECT_STATUS_LABELS } from "@/types/onboarding";

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

interface ProspectDetailSheetProps {
  open: boolean;
  prospectId: string | null;
  onClose: () => void;
  onListRefresh: () => void;
}

export function ProspectDetailSheet({
  open,
  prospectId,
  onClose,
  onListRefresh,
}: ProspectDetailSheetProps) {
  const queryClient = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data: prospect, isLoading, refetch } = useQuery({
    queryKey: ["prospect", prospectId],
    queryFn: () => fetchProspect(prospectId!),
    enabled: open && Boolean(prospectId),
  });

  const invalidate = () => {
    void refetch();
    onListRefresh();
    if (prospectId) {
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
    }
  };

  const approveMutation = useMutation({
    mutationFn: () => approveProspect(prospectId!),
    onSuccess: (ok) => {
      if (ok) {
        toast.success("Prospecto aprobado");
        invalidate();
      } else {
        toast.error("No se pudo aprobar el prospecto");
      }
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => rejectProspect(prospectId!, reason),
    onSuccess: (ok) => {
      if (ok) {
        toast.success("Prospecto rechazado");
        setRejectOpen(false);
        setRejectReason("");
        invalidate();
      } else {
        toast.error("No se pudo rechazar el prospecto");
      }
    },
  });

  const isFinal =
    prospect?.status === "approved" || prospect?.status === "rejected";

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Aprobar prospecto</SheetTitle>
          </SheetHeader>

          {isLoading ? (
            <Skeleton className="mt-6 h-64 w-full" />
          ) : prospect ? (
            <div className="mt-6 space-y-8">
              <section className="space-y-3">
                <h3 className="font-semibold">Detalle de prospecto</h3>
                <InfoRow label="Nombre:" value={prospect.company_name} />
                <InfoRow label="Email:" value={prospect.email} />
                <InfoRow label="RFC:" value={prospect.rfc} />
                <InfoRow label="Teléfono:" value={prospect.phone} />
                <InfoRow
                  label="Giro empresarial:"
                  value={prospect.economic_activity?.name}
                />
                <InfoRow
                  label="Estado:"
                  value={PROSPECT_STATUS_LABELS[prospect.status] ?? prospect.status}
                />
                {prospect.rejection_reason ? (
                  <InfoRow
                    label="Motivo de rechazo:"
                    value={prospect.rejection_reason}
                  />
                ) : null}
              </section>

              <section className="space-y-3 border-t pt-6">
                <h3 className="font-semibold">Validación de identidad</h3>
                <ProspectKycSection prospect={prospect} onUpdated={invalidate} />
              </section>

              <section className="space-y-3 border-t pt-6">
                <h3 className="font-semibold">Documentos</h3>
                <ProspectDocumentsTable
                  prospectId={prospect.uuid}
                  documents={prospect.documents ?? []}
                  onUpdated={invalidate}
                />
              </section>

              {!isFinal ? (
                <div className="flex flex-wrap gap-2 border-t pt-6">
                  <Button
                    variant="outline"
                    disabled={rejectMutation.isPending}
                    onClick={() => setRejectOpen(true)}
                  >
                    Rechazar
                  </Button>
                  <Button
                    disabled={
                      !canApproveProspect(prospect) || approveMutation.isPending
                    }
                    onClick={() => approveMutation.mutate()}
                  >
                    Aprobar
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-muted-foreground mt-6 text-sm">
              No se pudo cargar el prospecto.
            </p>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar prospecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Motivo de rechazo</Label>
            <Input
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={rejectReason.trim().length < 3 || rejectMutation.isPending}
              onClick={() => rejectMutation.mutate(rejectReason.trim())}
            >
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

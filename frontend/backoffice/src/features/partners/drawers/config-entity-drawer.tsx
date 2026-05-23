import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EntityAvatarFromEntity } from "@/components/entity/entity-avatar";
import { EntityStatusBadge } from "@/components/entity/entity-status-badge";
import { recoverPassword } from "@/features/auth/auth-api";
import {
  partnerToApprove,
  partnerToProcess,
  partnerToReject,
} from "@/features/partners/partners-api";
import { getDisplayName } from "@/lib/format";
import {
  EntityLayout,
  EntityStatus,
  type Customer,
  type Partner,
  type Wallet,
} from "@/types/partners";

interface ConfigEntityDrawerProps {
  layout: EntityLayout;
  entity: Partner | Customer | Wallet;
  onClose: () => void;
  onRefresh?: () => void;
}

export function ConfigEntityDrawer({
  layout,
  entity,
  onClose,
  onRefresh,
}: ConfigEntityDrawerProps) {
  const processMutation = useMutation({
    mutationFn: () => partnerToProcess(entity.id),
    onSuccess: (ok) => {
      if (ok) {
        toast.success("Partner en revisión");
        onRefresh?.();
        onClose();
      } else toast.error("No se pudo actualizar");
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => partnerToApprove(entity.id),
    onSuccess: (ok) => {
      if (ok) {
        toast.success("Partner aprobado");
        onRefresh?.();
        onClose();
      } else toast.error("No se pudo aprobar");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => partnerToReject(entity.id),
    onSuccess: (ok) => {
      if (ok) {
        toast.success("Partner rechazado");
        onRefresh?.();
        onClose();
      } else toast.error("No se pudo rechazar");
    },
  });

  const resetMutation = useMutation({
    mutationFn: () =>
      recoverPassword(entity.customer_id || entity.external_id, true),
    onSuccess: (ok) => {
      if (ok) {
        toast.success("Credenciales enviadas al correo del usuario");
        onClose();
      } else toast.error("Error al restablecer contraseña");
    },
  });

  const status = String(entity.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <EntityAvatarFromEntity
          image={entity.image}
          company_name={getDisplayName(entity)}
          contact_name={entity.contact_name}
          taxpayer_type_id={entity.taxpayer_type_id}
        />
        <div>
          <h2 className="text-xl font-semibold">{getDisplayName(entity)}</h2>
          <EntityStatusBadge status={status} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {layout === EntityLayout.Partners && status === EntityStatus.Created ? (
          <Button
            variant="secondary"
            onClick={() => processMutation.mutate()}
            disabled={processMutation.isPending}
          >
            Pasar a revisión
          </Button>
        ) : null}

        {layout === EntityLayout.Partners && status === EntityStatus.Process ? (
          <>
            <Button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
            >
              Aprobar
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
            >
              Rechazar
            </Button>
          </>
        ) : null}

        {(status === EntityStatus.Approved || layout !== EntityLayout.Partners) && (
          <Button
            variant="outline"
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
          >
            Restablecer contraseña
          </Button>
        )}
      </div>

      <p className="text-muted-foreground text-sm">
        Configuración avanzada de comisiones y límites estará disponible en una
        fase posterior.
      </p>
    </div>
  );
}

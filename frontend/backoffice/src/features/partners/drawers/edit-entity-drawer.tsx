import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EntityAvatarFromEntity } from "@/components/entity/entity-avatar";
import { getDisplayName } from "@/lib/format";
import { TypePerson, type Customer, type Partner, type Wallet } from "@/types/partners";

interface EditEntityDrawerProps {
  entity: Partner | Customer | Wallet;
  onClose: () => void;
}

export function EditEntityDrawer({ entity, onClose }: EditEntityDrawerProps) {
  const isFisica = entity.taxpayer_type_id === TypePerson.Fisica;
  const form = useForm({
    defaultValues: {
      company_name: entity.company_name ?? "",
      contact_name: entity.contact_name ?? "",
      contact_email: entity.contact_email ?? "",
      contact_tel: entity.contact_tel ?? "",
      name: (entity as Customer).name ?? "",
      ap_paterno: (entity as Customer).ap_paterno ?? "",
      ap_materno: (entity as Customer).ap_materno ?? "",
      affiliation_code: "",
      no_account:
        entity.accounts?.total === 1
          ? entity.accounts.data[0].clabes?.[0]?.account_id
          : "",
      clabe:
        entity.accounts?.total === 1
          ? entity.accounts.data[0].clabes?.[0]?.clabe
          : "",
    },
  });

  const onSubmit = form.handleSubmit(() => {
    toast.success("Cambios guardados localmente", {
      description:
        "La API de actualización no está conectada; revisa con backend si aplica.",
    });
    onClose();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <EntityAvatarFromEntity
          image={entity.image}
          company_name={getDisplayName(entity)}
          contact_name={entity.contact_name}
          taxpayer_type_id={entity.taxpayer_type_id}
        />
        <h2 className="text-lg font-semibold">{getDisplayName(entity)}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {isFisica ? (
          <>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>Apellido paterno</Label>
              <Input {...form.register("ap_paterno")} />
            </div>
            <div className="space-y-2">
              <Label>Apellido materno</Label>
              <Input {...form.register("ap_materno")} />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2 sm:col-span-2">
              <Label>Nombre de contacto</Label>
              <Input {...form.register("contact_name")} />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input {...form.register("contact_tel")} />
            </div>
            <div className="space-y-2">
              <Label>Código de afiliación</Label>
              <Input {...form.register("affiliation_code")} />
            </div>
          </>
        )}
        <div className="space-y-2 sm:col-span-2">
          <Label>Correo electrónico</Label>
          <Input type="email" {...form.register("contact_email")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Razón social / empresa</Label>
          <Input {...form.register("company_name")} />
        </div>
        {entity.accounts?.total === 1 ? (
          <>
            <div className="space-y-2">
              <Label>No. de cuenta</Label>
              <Input disabled {...form.register("no_account")} />
            </div>
            <div className="space-y-2">
              <Label>CLABE</Label>
              <Input disabled {...form.register("clabe")} />
            </div>
          </>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Button type="submit">Guardar</Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

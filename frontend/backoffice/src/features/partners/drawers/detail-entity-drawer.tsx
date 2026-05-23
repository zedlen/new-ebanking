import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EntityAvatarFromEntity } from "@/components/entity/entity-avatar";
import { EntityStatusBadge } from "@/components/entity/entity-status-badge";
import {
  customerAccountsPath,
  customerWalletsPath,
  movementsPath,
  partnerCustomersPath,
} from "@/features/partners/hierarchy";
import {
  formatAddress,
  getDisplayName,
  getPersonTypeLabel,
} from "@/lib/format";
import type { HierarchyIds } from "@/features/partners/hierarchy";
import {
  EntityLayout,
  TypePerson,
  type Account,
  type Customer,
  type Partner,
  type Wallet,
} from "@/types/partners";

interface DetailEntityDrawerProps {
  layout: EntityLayout;
  entity: Partner | Customer | Wallet | Account;
  context: HierarchyIds;
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

export function DetailEntityDrawer({
  layout,
  entity,
  context,
}: DetailEntityDrawerProps) {
  const navigate = useNavigate();
  const account = entity as Account;

  const title = getDisplayName(entity as Partner);

  const navActions = () => {
    if (layout === EntityLayout.Partners) {
      const p = entity as Partner;
      return (
        <>
          {p.accounts?.total === 1 ? (
            <Button
              size="sm"
              onClick={() =>
                navigate(
                  movementsPath(p.id, p.accounts.data[0].id),
                )
              }
            >
              Ver movimientos
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(partnerCustomersPath(p.id))}
          >
            Ver clientes
          </Button>
        </>
      );
    }
    if (layout === EntityLayout.Customers && context.partnerId) {
      const c = entity as Customer;
      return (
        <>
          {c.accounts?.total > 1 ? (
            <Button
              size="sm"
              onClick={() =>
                navigate(customerAccountsPath(context.partnerId!, c.id))
              }
            >
              Ver cuentas
            </Button>
          ) : c.accounts?.total === 1 ? (
            <Button
              size="sm"
              onClick={() =>
                navigate(
                  movementsPath(
                    context.partnerId!,
                    c.accounts.data[0].id,
                    c.id,
                  ),
                )
              }
            >
              Ver movimientos
            </Button>
          ) : null}
          {c.taxpayer_type_id === TypePerson.Moral ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                navigate(customerWalletsPath(context.partnerId!, c.id))
              }
            >
              Ver wallets
            </Button>
          ) : null}
        </>
      );
    }
    if (layout === EntityLayout.Wallets && context.partnerId && context.customerId) {
      const w = entity as Wallet;
      return w.accounts?.total > 1 ? (
        <Button
          size="sm"
          onClick={() =>
            navigate(
              `/home/partners/${context.partnerId}/${context.customerId}/${w.id}/accounts`,
            )
          }
        >
          Ver cuentas
        </Button>
      ) : w.accounts?.total === 1 ? (
        <Button
          size="sm"
          onClick={() =>
            navigate(
              movementsPath(
                context.partnerId!,
                w.accounts.data[0].id,
                context.customerId,
                w.id,
              ),
            )
          }
        >
          Ver movimientos
        </Button>
      ) : null;
    }
    if (layout === EntityLayout.Accounts && context.partnerId) {
      const a = entity as Account;
      return (
        <Button
          size="sm"
          onClick={() =>
            navigate(
              movementsPath(
                context.partnerId!,
                a.id,
                context.customerId,
                context.walletId,
              ),
            )
          }
        >
          Ver movimientos
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <EntityAvatarFromEntity
          image={(entity as Partner).image}
          company_name={title}
          contact_name={(entity as Customer).contact_name}
          taxpayer_type_id={(entity as Partner).taxpayer_type_id}
        />
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <EntityStatusBadge status={String((entity as Partner).status ?? "3")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {layout !== EntityLayout.Accounts ? (
          <>
            <Info label="Customer ID" value={(entity as Partner).external_id} />
            <Info label="Contacto" value={(entity as Customer).contact_name} />
            <Info label="Tipo cuenta" value="Cuenta de débito" />
            <Info
              label="Tipo persona"
              value={getPersonTypeLabel((entity as Partner).taxpayer_type_id)}
            />
            <Info
              label="Dirección"
              value={formatAddress((entity as Partner).address)}
            />
          </>
        ) : (
          <>
            <Info label="Cuenta" value={account.external_id} />
            <Info label="CLABE" value={account.clabes?.[0]?.clabe} />
            <Info
              label="Tipo persona"
              value={getPersonTypeLabel(account.type)}
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">{navActions()}</div>
    </div>
  );
}

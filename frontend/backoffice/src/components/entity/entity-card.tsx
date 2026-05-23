import type { ReactNode } from "react";
import { Download, Info, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EntityAvatarFromEntity } from "@/components/entity/entity-avatar";
import { EntityStatusBadge } from "@/components/entity/entity-status-badge";
import {
  formatCurrency,
  getDisplayName,
  getPersonTypeLabel,
} from "@/lib/format";
import { EntityLayout, TypePerson } from "@/types/partners";
import type { AccountsResponse } from "@/types/partners";

export interface EntityCardAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
}

interface EntityCardProps {
  layout: EntityLayout;
  title: string;
  subtitle?: string;
  image?: string;
  status: string;
  taxpayerTypeId?: TypePerson;
  externalId?: string;
  contactName?: string;
  accounts?: AccountsResponse;
  amount?: number;
  currency?: string;
  clabe?: string;
  accountNumber?: string;
  primaryActions?: EntityCardAction[];
  secondaryActions?: EntityCardAction[];
  topActions?: ReactNode;
  onDetail?: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span className="text-muted-foreground min-w-[120px] text-sm">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function EntityCard({
  layout,
  title,
  subtitle,
  image,
  status,
  taxpayerTypeId,
  externalId,
  contactName,
  accounts,
  amount,
  currency,
  clabe,
  accountNumber,
  primaryActions = [],
  secondaryActions = [],
  topActions,
  onDetail,
  onEdit,
  onDownload,
}: EntityCardProps) {
  const isAccount = layout === EntityLayout.Accounts;

  const toolbar = (
    <div className="flex shrink-0 gap-1">
      {onDetail ? (
        <Button size="icon" variant="ghost" onClick={onDetail} title="Detalle">
          <Info className="size-4" />
        </Button>
      ) : null}
      {onEdit && !isAccount ? (
        <Button size="icon" variant="ghost" onClick={onEdit} title="Editar">
          <Pencil className="size-4" />
        </Button>
      ) : null}
      {onDownload ? (
        <Button
          size="icon"
          variant="ghost"
          onClick={onDownload}
          title="Descargar movimientos"
        >
          <Download className="size-4" />
        </Button>
      ) : null}
      {topActions}
    </div>
  );
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <CardHeader className="flex flex-row items-start gap-4 border-b py-4">
        <EntityAvatarFromEntity
          image={image}
          company_name={title}
          contact_name={contactName ?? title}
          name={subtitle}
          taxpayer_type_id={taxpayerTypeId}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold">{title}</h3>
            <EntityStatusBadge status={status} />
          </div>
          {subtitle ? (
            <p className="text-muted-foreground truncate text-sm">{subtitle}</p>
          ) : null}
        </div>
        {(onDetail || onEdit || onDownload || topActions) ? toolbar : null}
      </CardHeader>

      <CardContent className="py-4">
        {isAccount ? (
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold tracking-tight">
                {formatCurrency(amount, currency)}
              </p>
              <p className="text-muted-foreground text-sm">Saldo disponible</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <InfoRow label="Customer ID" value={String(externalId ?? "")} />
              <InfoRow label="Cuenta" value={accountNumber} />
              <InfoRow label="CLABE" value={clabe} />
              {taxpayerTypeId !== undefined ? (
                <InfoRow
                  label="Tipo persona"
                  value={getPersonTypeLabel(taxpayerTypeId)}
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            <InfoRow label="Customer ID" value={externalId} />
            <InfoRow label="Contacto" value={contactName} />
            <InfoRow label="Tipo cuenta" value="Cuenta de débito" />
            {accounts?.total === 1 && accounts.data[0] ? (
              <InfoRow
                label="No. cuenta"
                value={accounts.data[0].clabes?.[0]?.account_id}
              />
            ) : null}
            {taxpayerTypeId !== undefined ? (
              <InfoRow
                label="Tipo persona"
                value={getPersonTypeLabel(taxpayerTypeId)}
              />
            ) : null}
          </div>
        )}
      </CardContent>

      {(primaryActions.length > 0 || secondaryActions.length > 0) && (
        <>
          <Separator />
          <CardFooter className="flex flex-wrap gap-2 py-4">
            {primaryActions.map((action) => (
              <Button
                key={action.label}
                size="sm"
                variant={action.variant ?? "default"}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
            {secondaryActions.map((action) => (
              <Button
                key={action.label}
                size="sm"
                variant={action.variant ?? "outline"}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </CardFooter>
        </>
      )}
    </Card>
  );
}

export function entityTitleFromRecord(
  record: {
    company_name?: string;
    contact_name?: string;
    name?: string;
    taxpayer_type_id?: TypePerson;
  },
  layout: EntityLayout,
): string {
  if (layout === EntityLayout.Accounts) {
    return record.name || getDisplayName(record);
  }
  return getDisplayName(record);
}

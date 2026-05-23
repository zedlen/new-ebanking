import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ConfigEntityDrawer } from "@/features/partners/drawers/config-entity-drawer";
import { CreditCardsDrawer } from "@/features/partners/drawers/credit-cards-drawer";
import { DetailEntityDrawer } from "@/features/partners/drawers/detail-entity-drawer";
import { DownloadMovementsDrawer } from "@/features/partners/drawers/download-movements-drawer";
import { EditEntityDrawer } from "@/features/partners/drawers/edit-entity-drawer";
import { VaultsDrawer } from "@/features/partners/drawers/vaults-drawer";
import { useDrawerStore } from "@/stores/drawer-store";
import { EntityLayout, type Account } from "@/types/partners";

const TITLES = {
  detail: "Detalle",
  edit: "Editar",
  download: "Descargar movimientos",
  config: "Configuración",
  vaults: "Bóvedas",
  cards: "Tarjetas",
};

export function EntityDrawerHost() {
  const {
    open,
    type,
    layout,
    entity,
    context,
    onRefresh,
    closeDrawer,
  } = useDrawerStore();

  const accountId =
    layout === EntityLayout.Accounts
      ? (entity as Account)?.id
      : entity && "accounts" in entity && entity.accounts?.data?.[0]
        ? entity.accounts.data[0].id
        : undefined;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && closeDrawer()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-lg md:max-w-xl"
      >
        <SheetHeader>
          <SheetTitle>{type ? TITLES[type] : ""}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 px-1">
          {entity && type === "detail" ? (
            <DetailEntityDrawer
              layout={layout}
              entity={entity}
              context={context}
            />
          ) : null}
          {entity &&
          type === "edit" &&
          layout !== EntityLayout.Accounts &&
          "company_name" in entity ? (
            <EditEntityDrawer
              entity={entity as import("@/types/partners").Customer}
              onClose={closeDrawer}
            />
          ) : null}
          {type === "download" && accountId ? (
            <DownloadMovementsDrawer
              context={context}
              accountId={accountId}
            />
          ) : null}
          {entity && type === "config" && "company_name" in entity ? (
            <ConfigEntityDrawer
              layout={layout}
              entity={entity as import("@/types/partners").Partner}
              onClose={closeDrawer}
              onRefresh={onRefresh}
            />
          ) : null}
          {type === "vaults" && context.partnerId ? (
            <VaultsDrawer
              partnerId={context.partnerId}
              onClose={closeDrawer}
            />
          ) : null}
          {type === "cards" && context.partnerId && context.customerId ? (
            <CreditCardsDrawer context={context} />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

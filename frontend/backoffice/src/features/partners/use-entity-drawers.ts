import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { EntityCardAction } from "@/components/entity/entity-card";
import type { HierarchyIds } from "@/features/partners/hierarchy";
import {
  cardsPath,
  customerAccountsPath,
  customerWalletsPath,
  movementsPath,
  partnerAccountsPath,
  partnerCustomersPath,
  registerCustomerPath,
  registerWalletPath,
  walletAccountsPath,
} from "@/features/partners/hierarchy";
import { useDrawerStore } from "@/stores/drawer-store";
import {
  EntityLayout,
  TypePerson,
  type Account,
  type Customer,
  type Partner,
  type Wallet,
} from "@/types/partners";

export function useEntityDrawers(context: HierarchyIds, layout: EntityLayout) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const openDrawer = useDrawerStore((s) => s.openDrawer);

  const refresh = () => queryClient.invalidateQueries();

  const open = (
    type: Parameters<typeof openDrawer>[0]["type"],
    entity: Partner | Customer | Wallet | Account,
  ) => {
    const ctx = { ...context };
    if (layout === EntityLayout.Customers && "contact_name" in entity) {
      ctx.customerId = entity.id;
    }
    if (layout === EntityLayout.Wallets && "contact_name" in entity) {
      ctx.walletId = entity.id;
    }
    openDrawer({ type, layout, entity, context: ctx, onRefresh: refresh });
  };

  const partnerActions = (partner: Partner): EntityCardAction[] => {
    const actions: EntityCardAction[] = [
      {
        label: "Ver clientes",
        onClick: () => navigate(partnerCustomersPath(partner.id)),
      },
    ];

    if (partner.accounts?.total > 0) {
      actions.unshift({
        label: "Ver movimientos",
        onClick: () =>
          navigate(movementsPath(partner.id, partner.accounts.data[0].id)),
      });
    }
    if (partner.accounts?.total > 1) {
      actions.unshift({
        label: "Ver cuentas",
        onClick: () => navigate(partnerAccountsPath(partner.id)),
      });
    }

    actions.push(
      { label: "Ver bóvedas", variant: "outline", onClick: () => open("vaults", partner) },
      { label: "Configuración", variant: "outline", onClick: () => open("config", partner) },
    );
    return actions;
  };

  const customerActions = (customer: Customer): EntityCardAction[] => {
    if (!context.partnerId) return [];
    const { partnerId } = context;
    const actions: EntityCardAction[] = [];

    if (customer.accounts?.total > 1) {
      actions.push({
        label: "Ver cuentas",
        onClick: () => navigate(customerAccountsPath(partnerId, customer.id)),
      });
    } else if (customer.accounts?.total === 1) {
      actions.push({
        label: "Ver movimientos",
        onClick: () =>
          navigate(
            movementsPath(partnerId, customer.accounts.data[0].id, customer.id),
          ),
      });
    }

    if (customer.taxpayer_type_id === TypePerson.Moral) {
      actions.push({
        label: "Ver wallets",
        onClick: () => navigate(customerWalletsPath(partnerId, customer.id)),
      });
    }

    actions.push(
      {
        label: "Ver tarjetas",
        variant: "outline",
        onClick: () => open("cards", customer),
      },
      { label: "Configuración", variant: "outline", onClick: () => open("config", customer) },
    );
    return actions;
  };

  const walletActions = (wallet: Wallet): EntityCardAction[] => {
    if (!context.partnerId || !context.customerId) return [];
    const { partnerId, customerId } = context;
    const actions: EntityCardAction[] = [];

    if (wallet.accounts?.total > 1) {
      actions.push({
        label: "Ver cuentas",
        onClick: () =>
          navigate(walletAccountsPath(partnerId, customerId, wallet.id)),
      });
    } else if (wallet.accounts?.total === 1) {
      actions.push({
        label: "Ver movimientos",
        onClick: () =>
          navigate(
            movementsPath(
              partnerId,
              wallet.accounts.data[0].id,
              customerId,
              wallet.id,
            ),
          ),
      });
    }

    actions.push(
      { label: "Ver tarjetas", variant: "outline", onClick: () => open("cards", wallet) },
      { label: "Configuración", variant: "outline", onClick: () => open("config", wallet) },
    );
    return actions;
  };

  const accountActions = (account: Account): EntityCardAction[] => {
    if (!context.partnerId) return [];
    return [
      {
        label: "Ver movimientos",
        onClick: () =>
          navigate(
            movementsPath(
              context.partnerId!,
              account.id,
              context.customerId,
              context.walletId,
            ),
          ),
      },
      {
        label: "Ver tarjetas",
        variant: "outline",
        onClick: () => {
          if (context.customerId) {
            navigate(
              cardsPath(
                context.partnerId!,
                context.customerId,
                context.walletId,
              ),
            );
          }
        },
      },
    ];
  };

  const registerAction = (
    entityId: string,
  ): EntityCardAction | null => {
    if (layout === EntityLayout.Partners) {
      return {
        label: "Alta cliente",
        variant: "outline",
        onClick: () => navigate(registerCustomerPath(entityId)),
      };
    }
    if (layout === EntityLayout.Customers && context.partnerId) {
      return {
        label: "Alta wallet",
        variant: "outline",
        onClick: () =>
          navigate(registerWalletPath(context.partnerId!, entityId)),
      };
    }
    return null;
  };

  const drawerHandlers = (entity: Partner | Customer | Wallet | Account) => ({
    onDetail: () => open("detail", entity),
    onEdit:
      layout === EntityLayout.Accounts
        ? undefined
        : () => open("edit", entity as Partner | Customer | Wallet),
    onDownload: () => open("download", entity),
  });

  return {
    partnerActions,
    customerActions,
    walletActions,
    accountActions,
    registerAction,
    drawerHandlers,
  };
}

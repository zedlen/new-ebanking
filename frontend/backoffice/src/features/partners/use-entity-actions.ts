import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { EntityCardAction } from "@/components/entity/entity-card";
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
import { EntityLayout, TypePerson } from "@/types/partners";
import type { Account, Customer, Partner, Wallet } from "@/types/partners";

function comingSoon() {
  toast.message("Próximamente", {
    description: "Esta acción estará disponible en la siguiente fase.",
  });
}

interface ActionContext {
  partnerId?: string;
  customerId?: string;
  walletId?: string;
}

export function useEntityActions(context: ActionContext) {
  const navigate = useNavigate();
  const { partnerId, customerId, walletId } = context;

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
          navigate(
            movementsPath(partner.id, partner.accounts.data[0].id),
          ),
      });
    }

    if (partner.accounts?.total > 1) {
      actions.unshift({
        label: "Ver cuentas",
        onClick: () => navigate(partnerAccountsPath(partner.id)),
      });
    }

    actions.push(
      {
        label: "Ver bóvedas",
        variant: "outline",
        onClick: comingSoon,
      },
      {
        label: "Configuración",
        variant: "outline",
        onClick: comingSoon,
      },
    );

    return actions;
  };

  const customerActions = (customer: Customer): EntityCardAction[] => {
    if (!partnerId) return [];
    const actions: EntityCardAction[] = [];

    if (customer.accounts?.total > 1) {
      actions.push({
        label: "Ver cuentas",
        onClick: () =>
          navigate(customerAccountsPath(partnerId, customer.id)),
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
        onClick: () =>
          navigate(customerWalletsPath(partnerId, customer.id)),
      });
    }

    actions.push(
      {
        label: "Ver tarjetas",
        variant: "outline",
        onClick: () => navigate(cardsPath(partnerId, customer.id)),
      },
      {
        label: "Configuración",
        variant: "outline",
        onClick: comingSoon,
      },
    );

    return actions;
  };

  const walletActions = (wallet: Wallet): EntityCardAction[] => {
    if (!partnerId || !customerId) return [];
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
      {
        label: "Ver tarjetas",
        variant: "outline",
        onClick: () =>
          navigate(cardsPath(partnerId, customerId, wallet.id)),
      },
      {
        label: "Configuración",
        variant: "outline",
        onClick: comingSoon,
      },
    );

    return actions;
  };

  const accountActions = (account: Account): EntityCardAction[] => {
    if (!partnerId) return [];
    return [
      {
        label: "Ver movimientos",
        onClick: () =>
          navigate(
            movementsPath(
              partnerId,
              account.id,
              customerId,
              walletId,
            ),
          ),
      },
      {
        label: "Ver tarjetas",
        variant: "outline",
        onClick: () =>
          customerId
            ? navigate(cardsPath(partnerId, customerId, walletId))
            : comingSoon(),
      },
    ];
  };

  const registerAction = (layout: EntityLayout, entityId: string): EntityCardAction | null => {
    if (layout === EntityLayout.Partners) {
      return {
        label: "Alta cliente",
        variant: "outline",
        onClick: () => navigate(registerCustomerPath(entityId)),
      };
    }
    if (layout === EntityLayout.Customers && partnerId) {
      return {
        label: "Alta wallet",
        variant: "outline",
        onClick: () => navigate(registerWalletPath(partnerId, entityId)),
      };
    }
    return null;
  };

  return {
    partnerActions,
    customerActions,
    walletActions,
    accountActions,
    registerAction,
    comingSoon,
  };
}

export function defaultEntityFilter(
  item: {
    company_name?: string;
    contact_name?: string;
    name?: string;
    external_id?: string;
    id?: string;
    clabes?: { clabe?: string }[];
  },
  query: string,
): boolean {
  const haystack = [
    item.company_name,
    item.contact_name,
    item.name,
    item.external_id,
    item.id,
    item.clabes?.[0]?.clabe,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

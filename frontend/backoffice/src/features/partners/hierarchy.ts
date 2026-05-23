import { PATHS } from "@/lib/constants";

export interface HierarchyIds {
  partnerId?: string;
  customerId?: string;
  walletId?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function partnerCustomersPath(partnerId: string): string {
  return `/home/partners/${partnerId}/customers`;
}

export function partnerAccountsPath(partnerId: string): string {
  return `/home/partners/${partnerId}/accounts`;
}

export function customerWalletsPath(partnerId: string, customerId: string): string {
  return `/home/partners/${partnerId}/${customerId}/wallets`;
}

export function customerAccountsPath(
  partnerId: string,
  customerId: string,
): string {
  return `/home/partners/${partnerId}/${customerId}/accounts`;
}

export function walletAccountsPath(
  partnerId: string,
  customerId: string,
  walletId: string,
): string {
  return `/home/partners/${partnerId}/${customerId}/${walletId}/accounts`;
}

export function movementsPath(
  partnerId: string,
  accountId: string,
  customerId?: string,
  walletId?: string,
): string {
  if (customerId && walletId) {
    return `/home/partners/${partnerId}/${customerId}/${walletId}/movements/${accountId}`;
  }
  if (customerId) {
    return `/home/partners/${partnerId}/${customerId}/movements/${accountId}`;
  }
  return `/home/partners/${partnerId}/movements/${accountId}`;
}

export function registerCustomerPath(partnerId: string): string {
  return `/home/register/${partnerId}`;
}

export function registerWalletPath(partnerId: string, customerId: string): string {
  return `/home/register/${partnerId}/${customerId}`;
}

export function cardsPath(
  partnerId: string,
  customerId: string,
  walletId?: string,
): string {
  if (walletId) {
    return `/home/partners/${partnerId}/${customerId}/${walletId}/cards`;
  }
  return `/home/partners/${partnerId}/${customerId}/cards`;
}

export function linkCardPath(
  partnerId: string,
  customerId: string,
  walletId?: string,
): string {
  return `${cardsPath(partnerId, customerId, walletId)}/link`;
}

export function cancelCardPath(
  partnerId: string,
  customerId: string,
  cardId: string,
  typeCard: string,
  walletId?: string,
): string {
  const base = cardsPath(partnerId, customerId, walletId);
  return `${base}/${cardId}/${typeCard}`;
}

export function buildBreadcrumbs(
  ids: HierarchyIds,
  labels: { partner?: string; customer?: string; wallet?: string },
  current: string,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Partners", href: PATHS.partners },
  ];

  if (ids.partnerId) {
    items.push({
      label: labels.partner ?? `Partner ${ids.partnerId}`,
      href: partnerCustomersPath(ids.partnerId),
    });
  }

  if (ids.customerId && ids.partnerId) {
    items.push({
      label: labels.customer ?? `Cliente ${ids.customerId}`,
      href: customerWalletsPath(ids.partnerId, ids.customerId),
    });
  }

  if (ids.walletId && ids.partnerId && ids.customerId) {
    items.push({
      label: labels.wallet ?? `Wallet ${ids.walletId}`,
      href: walletAccountsPath(ids.partnerId, ids.customerId, ids.walletId),
    });
  }

  items.push({ label: current });
  return items;
}

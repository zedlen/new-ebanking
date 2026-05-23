import { apiGet, apiPost } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  AccountsResponse,
  Customer,
  PaginatedResponse,
  Partner,
  SearchResults,
  Wallet,
} from "@/types/partners";

const empty = <T>(): PaginatedResponse<T> => ({ total: 0, data: [] });

export async function fetchPartners(
  offset: number,
  limit: number,
): Promise<PaginatedResponse<Partner>> {
  try {
    return await apiGet<PaginatedResponse<Partner>>(
      `${endpoints.partners}?offset=${offset}&limit=${limit}`,
    );
  } catch {
    return empty();
  }
}

export async function fetchCustomers(
  partnerId: string,
  offset: number,
  limit: number,
): Promise<PaginatedResponse<Customer>> {
  try {
    return await apiGet<PaginatedResponse<Customer>>(
      `${endpoints.partners}/${partnerId}/customers?offset=${offset}&limit=${limit}`,
    );
  } catch {
    return empty();
  }
}

export async function fetchWallets(
  partnerId: string,
  customerId: string,
  offset: number,
  limit: number,
): Promise<PaginatedResponse<Wallet>> {
  try {
    return await apiGet<PaginatedResponse<Wallet>>(
      `${endpoints.partners}/${partnerId}/customers/${customerId}/wallets?offset=${offset}&limit=${limit}`,
    );
  } catch {
    return empty();
  }
}

export async function fetchPartnerAccounts(
  partnerId: string,
  offset: number,
  limit: number,
): Promise<AccountsResponse> {
  try {
    return await apiGet<AccountsResponse>(
      `${endpoints.partners}/${partnerId}/accounts?offset=${offset}&limit=${limit}`,
    );
  } catch {
    return empty();
  }
}

export async function fetchCustomerAccounts(
  partnerId: string,
  customerId: string,
  offset: number,
  limit: number,
): Promise<AccountsResponse> {
  try {
    return await apiGet<AccountsResponse>(
      `${endpoints.partners}/${partnerId}/customers/${customerId}/accounts?offset=${offset}&limit=${limit}`,
    );
  } catch {
    return empty();
  }
}

export async function fetchWalletAccounts(
  partnerId: string,
  customerId: string,
  walletId: string,
  offset: number,
  limit: number,
): Promise<AccountsResponse> {
  try {
    return await apiGet<AccountsResponse>(
      `${endpoints.partners}/${partnerId}/customers/${customerId}/wallets/${walletId}/accounts?offset=${offset}&limit=${limit}`,
    );
  } catch {
    return empty();
  }
}

export async function searchEntities(query: string): Promise<SearchResults> {
  try {
    return await apiGet<SearchResults>(
      `${endpoints.searcher}?query=${encodeURIComponent(query)}`,
    );
  } catch {
    return { accounts: [], customers: [], wallets: [], partners: [] };
  }
}

export async function syncAllPartners(): Promise<void> {
  await apiPost(`${endpoints.partners}/sync-all`, {});
}

export async function partnerToProcess(partnerId: string): Promise<boolean> {
  try {
    await apiPost(`${endpoints.partners}/${partnerId}/process`, {});
    return true;
  } catch {
    return false;
  }
}

export async function partnerToApprove(partnerId: string): Promise<boolean> {
  try {
    await apiPost(`${endpoints.partners}/${partnerId}/approve`, {});
    return true;
  } catch {
    return false;
  }
}

export async function partnerToReject(partnerId: string): Promise<boolean> {
  try {
    await apiPost(`${endpoints.partners}/${partnerId}/reject`, {});
    return true;
  } catch {
    return false;
  }
}

export interface PartnerVaults {
  has_vaults?: boolean;
  spei_in?: Record<string, { amount?: number; customer_id?: string }>;
  spei_in_earnings?: Array<{ amount?: number; customer_id?: string }>;
  spei_out?: Record<string, { amount?: number }>;
  spei_out_earnings?: Array<{ amount?: number; customer_id?: string }>;
  transfers?: Record<string, { amount?: number }>;
  transfers_earnings?: Array<{ amount?: number; customer_id?: string }>;
  spei_in_total?: number;
  spei_out_total?: number;
  transfers_total?: number;
}

export async function fetchPartnerVaults(
  partnerId: string,
): Promise<PartnerVaults> {
  try {
    const data = await apiGet<PartnerVaults>(
      `${endpoints.partners}/${partnerId}/vaults`,
    );
    return { ...data, has_vaults: true };
  } catch {
    return { has_vaults: false };
  }
}

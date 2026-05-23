import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { EntityCard } from "@/components/entity/entity-card";
import { EntityListLayout } from "@/components/entity/entity-list-layout";
import {
  fetchCustomerAccounts,
  fetchPartnerAccounts,
  fetchWalletAccounts,
} from "@/features/partners/partners-api";
import { buildBreadcrumbs } from "@/features/partners/hierarchy";
import { defaultEntityFilter } from "@/features/partners/use-entity-actions";
import { useEntityDrawers } from "@/features/partners/use-entity-drawers";
import { usePagination } from "@/hooks/use-pagination";
import { EntityLayout, type Account } from "@/types/partners";

export function AccountsPage() {
  const { partnerId = "", customerId, walletId } = useParams();
  const { page, size, offset, setPage } = usePagination();
  const { accountActions, drawerHandlers } = useEntityDrawers(
    { partnerId, customerId, walletId },
    EntityLayout.Accounts,
  );

  const scope = walletId ? "wallet" : customerId ? "customer" : "partner";

  const { data, isLoading } = useQuery({
    queryKey: ["accounts", scope, partnerId, customerId, walletId, page, size],
    queryFn: async () => {
      if (walletId && customerId) {
        return fetchWalletAccounts(partnerId, customerId, walletId, offset, size);
      }
      if (customerId) {
        return fetchCustomerAccounts(partnerId, customerId, offset, size);
      }
      return fetchPartnerAccounts(partnerId, offset, size);
    },
    enabled: Boolean(partnerId),
  });

  const items = data?.data ?? [];
  const contextLabel = data?.info?.name;

  const breadcrumbCurrent = walletId
    ? "Cuentas del wallet"
    : customerId
      ? "Cuentas del cliente"
      : "Cuentas del partner";

  return (
    <EntityListLayout
      title="Cuentas"
      description={contextLabel ? `Titular: ${contextLabel}` : undefined}
      breadcrumbs={buildBreadcrumbs(
        { partnerId, customerId, walletId },
        { wallet: contextLabel, customer: contextLabel },
        breadcrumbCurrent,
      )}
      searchPlaceholder="Buscar por CLABE o ID"
      items={items}
      filterFn={(item, q) => defaultEntityFilter(item as Account, q)}
      isLoading={isLoading}
      emptyMessage="No hay cuentas en este nivel."
      page={page}
      total={data?.total ?? 0}
      pageSize={size}
      onPageChange={setPage}
      itemLabel="cuenta"
      renderItem={(item) => {
        const account = item as Account;
        const drawers = drawerHandlers(account);
        return (
          <EntityCard
            key={account.id}
            layout={EntityLayout.Accounts}
            title={account.external_id}
            subtitle={account.alias as string | undefined}
            status="3"
            taxpayerTypeId={account.type}
            externalId={String(account.customer_id)}
            amount={account.amount}
            currency={account.currency}
            clabe={account.clabes?.[0]?.clabe}
            accountNumber={account.clabes?.[0]?.account_id}
            primaryActions={accountActions(account)}
            onDetail={drawers.onDetail}
            onDownload={drawers.onDownload}
          />
        );
      }}
    />
  );
}

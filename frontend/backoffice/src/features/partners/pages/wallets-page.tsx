import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  EntityCard,
  entityTitleFromRecord,
} from "@/components/entity/entity-card";
import { EntityListLayout } from "@/components/entity/entity-list-layout";
import { fetchWallets } from "@/features/partners/partners-api";
import { buildBreadcrumbs } from "@/features/partners/hierarchy";
import { defaultEntityFilter } from "@/features/partners/use-entity-actions";
import { useEntityDrawers } from "@/features/partners/use-entity-drawers";
import { usePagination } from "@/hooks/use-pagination";
import { EntityLayout, type Wallet } from "@/types/partners";

export function WalletsPage() {
  const { partnerId = "", customerId = "" } = useParams();
  const { page, size, offset, setPage } = usePagination();
  const { walletActions, drawerHandlers } = useEntityDrawers(
    { partnerId, customerId },
    EntityLayout.Wallets,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["wallets", partnerId, customerId, page, size],
    queryFn: () => fetchWallets(partnerId, customerId, offset, size),
    enabled: Boolean(partnerId && customerId),
  });

  const items = data?.data ?? [];

  return (
    <EntityListLayout
      title="Wallets"
      breadcrumbs={buildBreadcrumbs(
        { partnerId, customerId },
        {
          customer: items[0]?.company_name,
        },
        "Wallets",
      )}
      items={items}
      filterFn={(item, q) => defaultEntityFilter(item as Wallet, q)}
      isLoading={isLoading}
      emptyMessage="Este cliente no tiene wallets."
      page={page}
      total={data?.total ?? 0}
      pageSize={size}
      onPageChange={setPage}
      itemLabel="wallet"
      renderItem={(item) => {
        const wallet = item as Wallet;
        const drawers = drawerHandlers(wallet);
        return (
          <EntityCard
            key={wallet.id}
            layout={EntityLayout.Wallets}
            title={entityTitleFromRecord(wallet, EntityLayout.Wallets)}
            image={wallet.image}
            status={String(wallet.status)}
            taxpayerTypeId={wallet.taxpayer_type_id}
            externalId={wallet.external_id}
            contactName={wallet.contact_name}
            accounts={wallet.accounts}
            primaryActions={walletActions(wallet)}
            {...drawers}
          />
        );
      }}
    />
  );
}

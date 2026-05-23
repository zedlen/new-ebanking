import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  EntityCard,
  entityTitleFromRecord,
} from "@/components/entity/entity-card";
import { EntityListLayout } from "@/components/entity/entity-list-layout";
import { fetchCustomers } from "@/features/partners/partners-api";
import { buildBreadcrumbs } from "@/features/partners/hierarchy";
import { defaultEntityFilter } from "@/features/partners/use-entity-actions";
import { useEntityDrawers } from "@/features/partners/use-entity-drawers";
import { usePagination } from "@/hooks/use-pagination";
import { EntityLayout, type Customer } from "@/types/partners";

export function CustomersPage() {
  const { partnerId = "" } = useParams();
  const { page, size, offset, setPage } = usePagination();
  const { customerActions, registerAction, drawerHandlers } = useEntityDrawers(
    { partnerId },
    EntityLayout.Customers,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["customers", partnerId, page, size],
    queryFn: () => fetchCustomers(partnerId, offset, size),
    enabled: Boolean(partnerId),
  });

  const items = data?.data ?? [];
  const partnerLabel = items[0]?.company_name;

  return (
    <EntityListLayout
      title="Clientes"
      breadcrumbs={buildBreadcrumbs(
        { partnerId },
        { partner: partnerLabel },
        "Clientes",
      )}
      searchPlaceholder="Buscar por nombre o ID"
      items={items}
      filterFn={(item, q) => defaultEntityFilter(item as Customer, q)}
      isLoading={isLoading}
      emptyMessage="Este partner no tiene clientes."
      page={page}
      total={data?.total ?? 0}
      pageSize={size}
      onPageChange={setPage}
      itemLabel="cliente"
      renderItem={(item) => {
        const customer = item as Customer;
        const register = registerAction(customer.id);
        const drawers = drawerHandlers(customer);
        return (
          <EntityCard
            key={customer.id}
            layout={EntityLayout.Customers}
            title={entityTitleFromRecord(customer, EntityLayout.Customers)}
            image={customer.image}
            status={String(customer.status)}
            taxpayerTypeId={customer.taxpayer_type_id}
            externalId={customer.external_id}
            contactName={customer.contact_name}
            accounts={customer.accounts}
            primaryActions={customerActions(customer)}
            secondaryActions={register ? [register] : []}
            {...drawers}
          />
        );
      }}
    />
  );
}

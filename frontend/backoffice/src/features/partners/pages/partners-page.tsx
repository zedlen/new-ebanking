import { useQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  EntityCard,
  entityTitleFromRecord,
} from "@/components/entity/entity-card";
import { EntityListLayout } from "@/components/entity/entity-list-layout";
import { Button } from "@/components/ui/button";
import { fetchPartners } from "@/features/partners/partners-api";
import { buildBreadcrumbs } from "@/features/partners/hierarchy";
import { defaultEntityFilter } from "@/features/partners/use-entity-actions";
import { useEntityDrawers } from "@/features/partners/use-entity-drawers";
import { usePagination } from "@/hooks/use-pagination";
import { PATHS } from "@/lib/constants";
import { EntityLayout, type Partner } from "@/types/partners";

export function PartnersPage() {
  const navigate = useNavigate();
  const { page, size, offset, setPage } = usePagination();
  const { partnerActions, registerAction, drawerHandlers } =
    useEntityDrawers({}, EntityLayout.Partners);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["partners", page, size],
    queryFn: () => fetchPartners(offset, size),
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <EntityListLayout
      title="Partners"
      description="Gestiona partners y accede a su estructura de clientes y cuentas."
      breadcrumbs={buildBreadcrumbs({}, {}, "Partners")}
      searchPlaceholder="Buscar por nombre o ID"
      items={items}
      filterFn={(item, q) => defaultEntityFilter(item as Partner, q)}
      isLoading={isLoading}
      emptyMessage="No hay partners registrados."
      page={page}
      total={total}
      pageSize={size}
      onPageChange={setPage}
      itemLabel="partner"
      headerActions={
        <Button onClick={() => navigate(PATHS.registerPartner)}>
          <UserPlus className="mr-2 size-4" />
          Alta partner
        </Button>
      }
      renderItem={(item) => {
        const partner = item as Partner;
        const register = registerAction(partner.id);
        const drawers = drawerHandlers(partner);
        return (
          <EntityCard
            key={partner.id}
            layout={EntityLayout.Partners}
            title={entityTitleFromRecord(partner, EntityLayout.Partners)}
            subtitle={partner.company_name}
            image={partner.image}
            status={String(partner.status)}
            taxpayerTypeId={partner.taxpayer_type_id}
            externalId={partner.external_id}
            contactName={partner.contact_name}
            accounts={partner.accounts}
            primaryActions={partnerActions(partner)}
            secondaryActions={register ? [register] : []}
            {...drawers}
            topActions={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
              >
                Actualizar
              </Button>
            }
          />
        );
      }}
    />
  );
}

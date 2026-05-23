import { useQuery } from "@tanstack/react-query";
import { Download, Eye, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { EntityAvatar } from "@/components/entity/entity-avatar";
import { ListPagination } from "@/components/entity/list-pagination";
import { MovementStatusBadge } from "@/components/entity/movement-status-badge";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MovementDetailSheet } from "@/features/movements/movement-detail-sheet";
import {
  downloadMovementVoucher,
  fetchMovements,
  movementListQueryKey,
} from "@/features/movements/movements-api";
import { buildBreadcrumbs } from "@/features/partners/hierarchy";
import { useDrawerStore } from "@/stores/drawer-store";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePagination } from "@/hooks/use-pagination";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { EntityLayout } from "@/types/partners";
import type { MovementContext, MovementListItem } from "@/types/movements";

export function MovementsPage() {
  const { partnerId = "", customerId, walletId, accountId = "" } = useParams();
  const { page, size, offset, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);
  const openDrawer = useDrawerStore((s) => s.openDrawer);

  const ctx: MovementContext = useMemo(
    () => ({
      partnerId,
      accountId,
      customerId,
      walletId,
    }),
    [partnerId, accountId, customerId, walletId],
  );

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: movementListQueryKey(ctx, page, size, debouncedSearch),
    queryFn: () => fetchMovements(ctx, offset, size, debouncedSearch),
    enabled: Boolean(partnerId && accountId),
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const info = data?.info;

  const breadcrumbs = buildBreadcrumbs(
    { partnerId, customerId, walletId },
    { partner: info?.name },
    "Movimientos",
  );

  const openDownload = () => {
    openDrawer({
      type: "download",
      layout: EntityLayout.Accounts,
      entity: {
        id: accountId,
        external_id: accountId,
        type: 1,
        amount: info?.balance ?? 0,
        currency: "MXN",
        linked_cellphone: null,
        customer_id: "",
        alias: null,
        creation_date: "",
        clabes: [],
      },
      context: { partnerId, customerId, walletId },
    });
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumbs items={breadcrumbs} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Movimientos</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      <div className="bg-muted/40 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <EntityAvatar image={info?.image} name={info?.name ?? "Cuenta"} />
          <div>
            <p className="font-semibold">{info?.name ?? "Cuenta"}</p>
            <p className="text-muted-foreground text-sm">Saldo en cuenta</p>
          </div>
        </div>
        <p className="text-2xl font-bold">
          {formatCurrency(info?.balance)}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={openDownload}>
            <Download className="size-4" />
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          className="pl-9"
          placeholder="Buscar por ID, referencia o concepto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">No hay movimientos disponibles</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Seguimiento</TableHead>
                    <TableHead>Estatus</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((mov) => (
                    <MovementRow
                      key={mov.id}
                      mov={mov}
                      onDetail={() => setDetailId(mov.id)}
                      onVoucher={() => downloadMovementVoucher(ctx, mov.id)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {items.map((mov) => (
              <div key={mov.id} className="rounded-lg border p-4">
                <div className="mb-2 flex justify-between">
                  <span className="font-mono text-xs">{mov.external_id}</span>
                  <MovementStatusBadge status={mov.status} />
                </div>
                <p className="font-semibold">{formatCurrency(mov.amount)}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDateTime(mov.operation_date)}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => setDetailId(mov.id)}
                >
                  Ver detalle
                </Button>
              </div>
            ))}
          </div>

          <ListPagination
            page={page}
            totalPages={Math.max(1, Math.ceil(total / size))}
            onPageChange={setPage}
            totalItems={total}
            itemLabel="movimiento"
          />
        </>
      )}

      <MovementDetailSheet
        open={Boolean(detailId)}
        movId={detailId}
        ctx={ctx}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}

function MovementRow({
  mov,
  onDetail,
  onVoucher,
}: {
  mov: MovementListItem;
  onDetail: () => void;
  onVoucher: () => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{mov.external_id}</TableCell>
      <TableCell className="text-xs">
        {mov.tracking_key ?? mov.folio}
      </TableCell>
      <TableCell>
        <MovementStatusBadge status={mov.status} />
      </TableCell>
      <TableCell>{formatCurrency(mov.amount)}</TableCell>
      <TableCell className="text-xs">
        {formatDateTime(mov.operation_date)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={onVoucher}>
            <Download className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDetail}>
            <Eye className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

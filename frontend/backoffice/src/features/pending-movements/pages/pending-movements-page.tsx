import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Eye } from "lucide-react";
import { useState } from "react";
import { ListPagination } from "@/components/entity/list-pagination";
import { MovementStatusBadge } from "@/components/entity/movement-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PendingMovementDetailSheet } from "@/features/pending-movements/components/pending-movement-detail-sheet";
import { fetchPendingMovements } from "@/features/pending-movements/pending-movements-api";
import { usePagination } from "@/hooks/use-pagination";
import { formatCurrency, formatDateTime } from "@/lib/format";

export function PendingMovementsPage() {
  const { page, size, offset, setPage, totalPages } = usePagination();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["pending-movements", page, size],
    queryFn: () => fetchPendingMovements(offset, size),
  });

  const movements = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-xl font-semibold">Aprobar movimientos</h1>
      </div>

      <Alert className="border-amber-300 bg-amber-50 text-amber-950">
        <AlertTriangle className="text-amber-700" />
        <AlertTitle>Datos de demostración — API pendiente</AlertTitle>
        <AlertDescription>
          Esta cola usa datos mock hasta que el backend exponga el endpoint de
          movimientos pendientes.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : movements.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No hay movimientos disponibles
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID movimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell className="font-mono text-xs">{mov.id}</TableCell>
                    <TableCell>
                      <MovementStatusBadge status={mov.status} />
                    </TableCell>
                    <TableCell>{formatCurrency(mov.amount)}</TableCell>
                    <TableCell>{formatDateTime(mov.operation_date)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedId(mov.id)}
                        >
                          <Eye className="mr-1 size-4" />
                          Ver
                        </Button>
                        <Button size="sm" variant="outline" disabled>
                          Rechazar
                        </Button>
                        <Button size="sm" disabled>
                          Aprobar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ListPagination
            page={page}
            totalPages={totalPages(total)}
            onPageChange={setPage}
            totalItems={total}
            itemLabel="movimiento"
          />
        </>
      )}

      <PendingMovementDetailSheet
        open={Boolean(selectedId)}
        movId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

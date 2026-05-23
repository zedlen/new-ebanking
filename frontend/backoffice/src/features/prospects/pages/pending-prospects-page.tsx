import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useState } from "react";
import { ListPagination } from "@/components/entity/list-pagination";
import { Badge } from "@/components/ui/badge";
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
import { ProspectDetailSheet } from "@/features/prospects/components/prospect-detail-sheet";
import { fetchOnboardings } from "@/features/onboarding/onboarding-api";
import { usePagination } from "@/hooks/use-pagination";
import type { Prospect } from "@/types/onboarding";

export function PendingProspectsPage() {
  const { page, size, offset, setPage, totalPages } = usePagination();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["prospects", page, size],
    queryFn: () => fetchOnboardings(offset, size),
  });

  const prospects = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-xl font-semibold">Aprobar prospectos</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Revisa KYC y documentos antes de aprobar un prospecto.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : prospects.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No hay prospectos pendientes por aprobar
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>RFC</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prospects.map((row: Prospect) => (
                  <TableRow key={row.uuid}>
                    <TableCell className="font-medium">
                      {row.company_name}
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.rfc}</TableCell>
                    <TableCell className="text-right">
                      {row.status === "approved" ? (
                        <Badge className="bg-green-600">Aprobado</Badge>
                      ) : row.status === "rejected" ? (
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="destructive">Rechazado</Badge>
                          {row.rejection_reason ? (
                            <span className="text-muted-foreground max-w-[200px] text-xs">
                              {row.rejection_reason}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setSelectedId(row.uuid)}
                        >
                          <Eye className="mr-1 size-4" />
                          Ver detalle
                        </Button>
                      )}
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
            itemLabel="prospecto"
          />
        </>
      )}

      <ProspectDetailSheet
        open={Boolean(selectedId)}
        prospectId={selectedId}
        onClose={() => setSelectedId(null)}
        onListRefresh={() => void refetch()}
      />
    </div>
  );
}

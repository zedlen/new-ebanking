import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
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
import { fetchPayoutMonthly } from "@/features/payouts/payouts-api";
import { sumMonthlyRows } from "@/features/payouts/payout-mappers";
import { formatCurrency } from "@/lib/format";

function formatApiDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDefaultRange() {
  const to = new Date();
  const from = new Date(to);
  from.setMonth(from.getMonth() - 24);
  from.setDate(1);
  return { from, to };
}

export function PayoutMonthlyTab() {
  const { from, to } = getDefaultRange();
  const fromStr = formatApiDate(from);
  const toStr = formatApiDate(to);

  const { data = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["payout-monthly", fromStr, toStr],
    queryFn: () => fetchPayoutMonthly(fromStr, toStr),
  });

  const grandTotal = sumMonthlyRows(data);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Liquidaciones por mes</h2>
          <p className="text-muted-foreground text-sm">
            Desde {from.toLocaleDateString("es-MX")} hasta{" "}
            {to.toLocaleDateString("es-MX")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          <RefreshCw className="mr-2 size-4" />
          Refrescar
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <>
          <p className="text-sm">
            <span className="font-semibold">Total: </span>
            {formatCurrency(grandTotal)}
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={`${row.month}-${index}`}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell>{row.customer ?? row.customer_name ?? "Onsigna"}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

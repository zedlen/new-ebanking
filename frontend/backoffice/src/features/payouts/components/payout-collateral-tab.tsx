import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchCollateralMonthReport } from "@/features/payouts/payouts-api";
import {
  appendCollateralTotalRow,
  collateralAmount,
  collateralDailyAverage,
} from "@/features/payouts/payout-mappers";
import { formatCurrency } from "@/lib/format";
import type { CollateralReportRow } from "@/types/payouts";

function formatApiDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthRange(offsetMonths: number) {
  const start = new Date();
  start.setDate(1);
  start.setMonth(start.getMonth() + offsetMonths);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  return { start, end, days: end.getDate() };
}

interface CollateralTableProps {
  title: string;
  description: string;
  rows: CollateralReportRow[];
  daysInPeriod: number;
  collateralDays: number;
}

function CollateralTable({
  title,
  description,
  rows,
  daysInPeriod,
  collateralDays,
}: CollateralTableProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Operaciones</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Promedio diario</TableHead>
              <TableHead className="text-right">
                Colateral ({collateralDays} días)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={`${row.customer_name}-${index}`}
                className={
                  row.customer_name === "TOTAL" ? "bg-muted/40 font-semibold" : ""
                }
              >
                <TableCell>{row.customer ?? "—"}</TableCell>
                <TableCell>{row.customer_name || "ONSIGNA"}</TableCell>
                <TableCell>{row.count ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(row.total)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    collateralDailyAverage(row.total, daysInPeriod),
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    collateralAmount(row.total, daysInPeriod, collateralDays),
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function PayoutCollateralTab() {
  const [collateralDays, setCollateralDays] = useState(7);

  const previous = useMemo(() => monthRange(-1), []);
  const current = useMemo(() => monthRange(0), []);

  const prevFrom = formatApiDate(previous.start);
  const prevTo = formatApiDate(previous.end);
  const currFrom = formatApiDate(current.start);
  const currTo = formatApiDate(current.end);

  const { data: previousRaw = [], isLoading: loadingPrev, refetch, isFetching } =
    useQuery({
      queryKey: ["collateral-prev", prevFrom, prevTo],
      queryFn: () => fetchCollateralMonthReport(prevFrom, prevTo),
    });

  const { data: currentRaw = [], isLoading: loadingCurr } = useQuery({
    queryKey: ["collateral-curr", currFrom, currTo],
    queryFn: () => fetchCollateralMonthReport(currFrom, currTo),
  });

  const previousRows = appendCollateralTotalRow(
    previousRaw.filter((r) => r.customer_name !== "TOTAL"),
    previous.start.toISOString().slice(0, 7),
  );

  const currentRows = appendCollateralTotalRow(
    currentRaw.filter((r) => r.customer_name !== "TOTAL"),
    current.start.toISOString().slice(0, 7),
  );

  const loading = loadingPrev || loadingCurr;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Total de colaterales</h2>
          <p className="text-muted-foreground text-sm">
            Cálculo según operaciones y días de colateralización
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

      <div className="max-w-xs space-y-2">
        <Label htmlFor="collateral-days">Días de colateralización</Label>
        <Input
          id="collateral-days"
          type="number"
          min={1}
          value={collateralDays}
          onChange={(e) =>
            setCollateralDays(Math.max(1, Number(e.target.value) || 1))
          }
        />
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <CollateralTable
            title="Mes anterior"
            description={`Operaciones del ${prevFrom} al ${prevTo}, colateralización de ${collateralDays} días.`}
            rows={previousRows}
            daysInPeriod={previous.days}
            collateralDays={collateralDays}
          />
          <CollateralTable
            title="Mes corriente"
            description={`Operaciones del ${currFrom} al ${currTo}, colateralización de ${collateralDays} días.`}
            rows={currentRows}
            daysInPeriod={current.days}
            collateralDays={collateralDays}
          />
        </>
      )}
    </div>
  );
}

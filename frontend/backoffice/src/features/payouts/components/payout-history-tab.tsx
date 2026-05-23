import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPayoutHistory } from "@/features/payouts/payouts-api";
import { sumPayoutHistoryTotal } from "@/features/payouts/payout-mappers";
import { formatCurrency } from "@/lib/format";

function formatApiDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDefaultRange() {
  const to = new Date();
  const from = new Date(to);
  from.setMonth(from.getMonth() - 1);
  from.setDate(1);
  return { from, to };
}

export function PayoutHistoryTab() {
  const { from, to } = getDefaultRange();
  const fromStr = formatApiDate(from);
  const toStr = formatApiDate(to);

  const { data = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["payout-history", fromStr, toStr],
    queryFn: () => fetchPayoutHistory(fromStr, toStr),
  });

  const displayFrom = from.toLocaleDateString("es-MX");
  const displayTo = to.toLocaleDateString("es-MX");
  const grandTotal = sumPayoutHistoryTotal(data);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Historial de liquidaciones</h2>
          <p className="text-muted-foreground text-sm">
            Liquidaciones del mes anterior ({displayFrom} – {displayTo})
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
      ) : data.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No hay liquidaciones en el período seleccionado
        </p>
      ) : (
        <>
          <p className="text-sm">
            <span className="font-semibold">Total: </span>
            {formatCurrency(grandTotal)}
          </p>
          <div className="space-y-3">
            {data.map((day) => {
              const dayTotal = day.results.reduce((s, r) => s + r.total, 0);
              return (
                <details key={day.date} className="rounded-lg border">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-medium">
                    <span>{day.date}</span>
                    <span className="text-green-600">
                      Total: {formatCurrency(dayTotal)}
                    </span>
                  </summary>
                  <div className="divide-y border-t">
                    {day.results.map((result, index) => (
                      <div
                        key={`${day.date}-${index}`}
                        className="flex items-center justify-between px-4 py-2 text-sm"
                      >
                        <span>{result.customer ?? "Onsigna"}</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(result.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadMovementsReport } from "@/features/movements/movements-api";
import { formatDateForApi } from "@/lib/format";
import type { HierarchyIds } from "@/features/partners/hierarchy";
import type { MovementContext } from "@/types/movements";

interface DownloadMovementsDrawerProps {
  context: HierarchyIds;
  accountId: string;
}

export function DownloadMovementsDrawer({
  context,
  accountId,
}: DownloadMovementsDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.partnerId || !start || !end) {
      toast.error("Selecciona el rango de fechas");
      return;
    }

    const movCtx: MovementContext = {
      partnerId: context.partnerId,
      accountId,
      customerId: context.customerId,
      walletId: context.walletId,
    };

    setLoading(true);
    try {
      const startFmt = formatDateForApi(new Date(start));
      const endFmt = formatDateForApi(new Date(end));
      await downloadMovementsReport(movCtx, startFmt, endFmt);
      toast.success("Descarga iniciada");
    } catch {
      toast.error("No se pudo descargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">
          Reporte de movimientos por periodo
        </h2>
        <p className="text-muted-foreground text-sm">
          Comprobantes de transacciones e informes de comisiones
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start">Desde</Label>
          <Input
            id="start"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">Hasta</Label>
          <Input
            id="end"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Generando…" : "Descargar reporte"}
      </Button>
    </form>
  );
}

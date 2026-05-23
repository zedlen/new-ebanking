import { useState } from "react";
import { cn } from "@/lib/utils";
import { PayoutCollateralTab } from "@/features/payouts/components/payout-collateral-tab";
import { PayoutHistoryTab } from "@/features/payouts/components/payout-history-tab";
import { PayoutMonthlyTab } from "@/features/payouts/components/payout-monthly-tab";
import { PayoutUploadTab } from "@/features/payouts/components/payout-upload-tab";

const TABS = [
  { id: "upload", label: "Cargar nuevo archivo" },
  { id: "history", label: "Historial de cargos" },
  { id: "monthly", label: "Liquidaciones por mes" },
  { id: "collateral", label: "Total de colaterales" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PayoutsPage() {
  const [active, setActive] = useState<TabId>("upload");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Archivos de liquidación</h1>

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "upload" ? <PayoutUploadTab /> : null}
      {active === "history" ? <PayoutHistoryTab /> : null}
      {active === "monthly" ? <PayoutMonthlyTab /> : null}
      {active === "collateral" ? <PayoutCollateralTab /> : null}
    </div>
  );
}

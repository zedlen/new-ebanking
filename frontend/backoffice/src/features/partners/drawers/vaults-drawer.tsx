import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPartnerVaults } from "@/features/partners/partners-api";
import { formatCurrency } from "@/lib/format";

interface VaultsDrawerProps {
  partnerId: string;
  onClose: () => void;
}

const PARTNER_LABELS: Record<string, string> = {
  "307019624": "Constructora",
  "984236813": "Livingrock",
  "533361373": "BFN",
  "841665563": "Laboras",
};

function VaultRow({ label, value }: { label: string; value?: string }) {
  if (value === undefined) return null;
  return (
    <div className="flex justify-between border-b py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function VaultsDrawer({ partnerId, onClose }: VaultsDrawerProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["vaults", partnerId],
    queryFn: () => fetchPartnerVaults(partnerId),
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!data?.has_vaults) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Partner sin comisiones asignadas</p>
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Bóvedas del partner</h2>

      <section className="space-y-2">
        <h3 className="font-medium">SPEI IN</h3>
        <VaultRow
          label="Propia"
          value={formatCurrency(data.spei_in?.own?.amount)}
        />
        {data.spei_in_earnings?.map((e) => (
          <VaultRow
            key={e.customer_id}
            label={PARTNER_LABELS[e.customer_id ?? ""] ?? "Otro"}
            value={formatCurrency(e.amount)}
          />
        ))}
        <VaultRow label="Total" value={formatCurrency(data.spei_in_total)} />
      </section>

      <section className="space-y-2">
        <h3 className="font-medium">SPEI OUT</h3>
        <VaultRow
          label="Propia"
          value={formatCurrency(data.spei_out?.own?.amount)}
        />
        {data.spei_out_earnings?.map((e) => (
          <VaultRow
            key={e.customer_id}
            label={PARTNER_LABELS[e.customer_id ?? ""] ?? "Otro"}
            value={formatCurrency(e.amount)}
          />
        ))}
        <VaultRow label="Total" value={formatCurrency(data.spei_out_total)} />
      </section>

      <section className="space-y-2">
        <h3 className="font-medium">Transferencias</h3>
        <VaultRow
          label="Propia"
          value={formatCurrency(data.transfers?.own?.amount)}
        />
        {data.transfers_earnings?.map((e) => (
          <VaultRow
            key={e.customer_id}
            label={PARTNER_LABELS[e.customer_id ?? ""] ?? "Otro"}
            value={formatCurrency(e.amount)}
          />
        ))}
        <VaultRow
          label="Total"
          value={formatCurrency(data.transfers_total)}
        />
      </section>

      <Button onClick={onClose}>Cerrar</Button>
    </div>
  );
}

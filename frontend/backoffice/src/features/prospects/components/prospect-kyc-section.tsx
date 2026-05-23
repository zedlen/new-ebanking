import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { requestProspectKyc } from "@/features/onboarding/onboarding-api";
import {
  KYC_STATUS_LABELS,
  KYC_STEP_LABELS,
  type KycFeatureData,
  type Prospect,
} from "@/types/onboarding";

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

interface ProspectKycSectionProps {
  prospect: Prospect;
  onUpdated: () => void;
}

export function ProspectKycSection({
  prospect,
  onUpdated,
}: ProspectKycSectionProps) {
  const kycMutation = useMutation({
    mutationFn: () => requestProspectKyc(prospect.uuid),
    onSuccess: (ok) => {
      if (ok) {
        toast.success("Validación de identidad solicitada");
        onUpdated();
      } else {
        toast.error("No se pudo solicitar la validación");
      }
    },
  });

  if (!prospect.requested_kyc) {
    return (
      <Button
        disabled={kycMutation.isPending}
        onClick={() => kycMutation.mutate()}
      >
        Solicitar validación de identidad
      </Button>
    );
  }

  const kyc = prospect.kycStatus;
  if (!kyc) return null;

  const payload = kyc.providerPayload;
  const statusLabel =
    KYC_STATUS_LABELS[payload?.status ?? ""] ??
    KYC_STATUS_LABELS[kyc.status ?? ""] ??
    kyc.status;

  return (
    <div className="space-y-4">
      <InfoRow label="Estado:" value={statusLabel} />

      {payload?.features?.map((feature) => {
        const mapping = KYC_STEP_LABELS[feature];
        if (!mapping) return null;
        const featureData = payload[mapping.key as keyof typeof payload] as
          | KycFeatureData
          | undefined;

        return (
          <div key={mapping.key} className="rounded-lg border p-4">
            <p className="mb-2 font-medium">{mapping.name}</p>
            {featureData ? (
              <>
                <InfoRow
                  label="Estado:"
                  value={
                    KYC_STATUS_LABELS[featureData.status ?? ""] ??
                    featureData.status
                  }
                />
                {mapping.hasScore ? (
                  <InfoRow label="Puntaje:" value={featureData.score} />
                ) : null}
                {featureData.warnings?.length ? (
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {featureData.warnings.map((w, i) => (
                      <li key={i}>{w.short_description}</li>
                    ))}
                  </ul>
                ) : null}
              </>
            ) : (
              <InfoRow label="Estado:" value="No realizado" />
            )}
          </div>
        );
      })}
    </div>
  );
}

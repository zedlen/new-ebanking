import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { CardOtpSection } from "@/components/cards/card-otp-section";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { requestOtpCancelCard } from "@/features/auth/auth-api";
import { cancelCard } from "@/features/cards/cards-api";
import { buildBreadcrumbs, cardsPath } from "@/features/partners/hierarchy";
import { cancelReasonsForCardType, CardStatus } from "@/types/cards";

const cancelSchema = z.object({
  statusReason: z.string().min(1, "Selecciona un motivo"),
});

type CancelFormValues = z.infer<typeof cancelSchema>;

export function CancelCardPage() {
  const navigate = useNavigate();
  const { partnerId, customerId, walletId, cardId, typeCard } = useParams();
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cardsCtx = {
    partnerId: partnerId!,
    customerId: customerId!,
    walletId,
  };

  const form = useForm<CancelFormValues>({
    resolver: zodResolver(cancelSchema),
    defaultValues: { statusReason: "" },
  });

  const reasons = cancelReasonsForCardType(typeCard ?? "");

  const handleSubmit = form.handleSubmit(async (values) => {
    if (otp.length !== 6) {
      toast.error("Ingresa el código OTP de 6 dígitos");
      return;
    }

    setSubmitting(true);
    const ok = await cancelCard(
      cardsCtx,
      cardId!,
      { status: CardStatus.Cancelled, statusReason: values.statusReason },
      otp,
    );
    setSubmitting(false);
    setOtp("");

    if (ok) {
      toast.success("Tarjeta cancelada correctamente");
      navigate(cardsPath(partnerId!, customerId!, walletId));
      return;
    }

    toast.error("Error al cancelar tarjeta, por favor, intenta más tarde");
  });

  return (
    <div className="space-y-6">
      <PageBreadcrumbs
        items={[
          ...buildBreadcrumbs({ partnerId, customerId, walletId }, {}, "Tarjetas"),
          { label: "Deshabilitar tarjeta" },
        ]}
      />

      <h1 className="text-xl font-semibold">Deshabilitar tarjeta</h1>

      <div className="rounded-2xl border bg-muted/20 p-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="bg-primary/10 text-primary flex size-16 shrink-0 items-center justify-center rounded-2xl">
            <CreditCard className="size-8" />
          </div>

          <div className="min-w-0 flex-1 space-y-6">
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="space-y-6"
              data-testid="form-cancel-card"
            >
              <div className="max-w-md space-y-2">
                <Label htmlFor="statusReason">
                  Elige un motivo por el que deseas cancelar la tarjeta
                </Label>
                <select
                  id="statusReason"
                  className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                  {...form.register("statusReason")}
                >
                  <option value="">Selecciona una opción</option>
                  {reasons.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {form.formState.errors.statusReason ? (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.statusReason.message}
                  </p>
                ) : null}
              </div>

              <CardOtpSection
                mode="cancel"
                otp={otp}
                onOtpChange={setOtp}
                onRequestOtp={requestOtpCancelCard}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigate(cardsPath(partnerId!, customerId!, walletId))
                  }
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="min-w-[180px] rounded-full"
                  disabled={
                    submitting ||
                    !form.formState.isValid ||
                    otp.length !== 6
                  }
                >
                  {submitting ? "Procesando…" : "Deshabilitar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

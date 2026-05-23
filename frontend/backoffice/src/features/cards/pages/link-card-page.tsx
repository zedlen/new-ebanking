import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { CardOtpSection } from "@/components/cards/card-otp-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { requestOtpLinkCard } from "@/features/auth/auth-api";
import { linkCard } from "@/features/cards/cards-api";
import {
  fetchCustomerAccounts,
  fetchWalletAccounts,
} from "@/features/partners/partners-api";
import { buildBreadcrumbs, cardsPath } from "@/features/partners/hierarchy";

const linkSchema = z.object({
  pan: z
    .string()
    .length(16, "Ingresa exactamente 16 dígitos")
    .regex(/^\d+$/, "Ingresa solo números"),
  accountId: z.string().min(1, "Selecciona una cuenta"),
});

type LinkFormValues = z.infer<typeof linkSchema>;

export function LinkCardPage() {
  const navigate = useNavigate();
  const { partnerId, customerId, walletId } = useParams();
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cardsCtx = {
    partnerId: partnerId!,
    customerId: customerId!,
    walletId,
  };

  const accountsQuery = useQuery({
    queryKey: ["link-card-accounts", cardsCtx],
    queryFn: async () => {
      if (walletId) {
        const res = await fetchWalletAccounts(
          partnerId!,
          customerId!,
          walletId,
          0,
          50,
        );
        return res.data;
      }
      const res = await fetchCustomerAccounts(partnerId!, customerId!, 0, 50);
      return res.data;
    },
    enabled: Boolean(partnerId && customerId),
  });

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: { pan: "", accountId: "" },
  });

  const accounts = accountsQuery.data ?? [];

  useEffect(() => {
    if (accounts.length === 1) {
      form.setValue("accountId", accounts[0].id);
    }
  }, [accounts, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (otp.length !== 6) {
      toast.error("Ingresa el código OTP de 6 dígitos");
      return;
    }

    setSubmitting(true);
    const ok = await linkCard(cardsCtx, values, otp);
    setSubmitting(false);
    setOtp("");

    if (ok) {
      toast.success("Tarjeta vinculada correctamente");
      navigate(cardsPath(partnerId!, customerId!, walletId));
      return;
    }

    toast.error(
      "El código no es válido, verifica si ya expiró.",
    );
  });

  return (
    <div className="space-y-6">
      <PageBreadcrumbs
        items={[
          ...buildBreadcrumbs({ partnerId, customerId, walletId }, {}, "Tarjetas"),
          { label: "Vincular tarjeta" },
        ]}
      />

      <h1 className="text-xl font-semibold">Vinculación de tarjeta</h1>

      <div className="rounded-2xl border bg-muted/20 p-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="bg-primary/10 text-primary flex size-16 shrink-0 items-center justify-center rounded-2xl">
            <CreditCard className="size-8" />
          </div>

          <div className="min-w-0 flex-1 space-y-6">
            <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center">
              <p className="font-semibold text-destructive">Importante:</p>
              <p className="text-sm">
                Una vez vinculada la tarjeta no se puede desvincular
              </p>
            </div>

            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="space-y-6"
              data-testid="form-link-card"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pan">Ingresa los 16 dígitos de tu tarjeta</Label>
                  <Input
                    id="pan"
                    maxLength={16}
                    placeholder="****************"
                    className="font-mono tracking-widest"
                    {...form.register("pan")}
                  />
                  {form.formState.errors.pan ? (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.pan.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountId">Cuenta a vincular tarjeta</Label>
                  <select
                    id="accountId"
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                    disabled={accounts.length <= 1 && accounts.length > 0}
                    {...form.register("accountId")}
                  >
                    <option value="">Seleccione una cuenta</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.external_id}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.accountId ? (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.accountId.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <CardOtpSection
                mode="link"
                otp={otp}
                onOtpChange={setOtp}
                onRequestOtp={requestOtpLinkCard}
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
                  className="min-w-[180px] rounded-full"
                  disabled={
                    submitting ||
                    !form.formState.isValid ||
                    otp.length !== 6
                  }
                >
                  {submitting ? "Vinculando…" : "Vincular"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

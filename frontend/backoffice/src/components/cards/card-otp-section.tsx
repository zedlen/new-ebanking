import { useState } from "react";
import { toast } from "sonner";
import { OtpInput } from "@/components/cards/otp-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface CardOtpSectionProps {
  mode: "link" | "cancel";
  otp: string;
  onOtpChange: (value: string) => void;
  onRequestOtp: () => Promise<boolean>;
}

export function CardOtpSection({
  mode,
  otp,
  onOtpChange,
  onRequestOtp,
}: CardOtpSectionProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const ok = await onRequestOtp();
    setLoading(false);
    if (ok) {
      toast.success("Hemos enviado el código generado a tu email");
    } else {
      toast.error(
        "Ha ocurrido un error al intentar generar el código, por favor, intenta más tarde",
      );
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border bg-muted/40 p-6">
        <p className="mb-4 text-sm">
          Para tu seguridad te enviaremos un código a tu email.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="rounded-full"
          disabled={loading}
          onClick={() => void handleGenerate()}
        >
          {loading ? "Generando…" : "Generar código"}
        </Button>
      </div>
      <div className="rounded-xl border p-6">
        <Label className="mb-3 block">
          Ingresa el código enviado a tu email
        </Label>
        <OtpInput
          value={otp}
          onChange={onOtpChange}
          className="justify-center md:justify-start"
        />
        {mode === "link" ? (
          <p className="text-muted-foreground mt-3 text-xs">
            Necesitas el código de 6 dígitos para vincular la tarjeta.
          </p>
        ) : null}
      </div>
    </div>
  );
}

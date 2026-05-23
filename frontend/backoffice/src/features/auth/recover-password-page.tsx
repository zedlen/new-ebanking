import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import zeuspayLogo from "@/assets/zeuspay-logo.svg";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recoverPassword } from "@/features/auth/auth-api";
import { PATHS } from "@/lib/constants";

const schema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

type FormValues = z.infer<typeof schema>;

export function RecoverPasswordPage() {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const ok = await recoverPassword(values.email);
    setLoading(false);

    if (ok) {
      toast.success("Revisa tu correo para restablecer la contraseña");
      form.reset();
    } else {
      toast.error("No pudimos enviar el correo. Intenta de nuevo.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img
            src={zeuspayLogo}
            alt="ZeusPay"
            className="mx-auto mb-2 h-10 w-auto"
          />
          <CardTitle>Recuperar contraseña</CardTitle>
          <CardDescription>
            Te enviaremos instrucciones a tu correo registrado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando…" : "Enviar enlace"}
            </Button>
          </form>
          <p className="text-muted-foreground mt-4 text-center text-sm">
            <Link to={PATHS.login} className="text-primary hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

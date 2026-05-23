import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import zeuspayLogo from "@/assets/zeuspay-logo.svg";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/features/auth/use-login";
import { PATHS } from "@/lib/constants";

const loginSchema = z.object({
  username: z.string().min(1, "Ingresa tu usuario"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const {
    isLoading,
    error,
    sessionConflict,
    submit,
    forceLogin,
    dismissConflict,
  } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const ok = await submit(values);
    if (ok) navigate(PATHS.partners);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-accent/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <img
            src={zeuspayLogo}
            alt="ZeusPay"
            className="mx-auto h-12 w-auto"
          />
          <div>
            <CardTitle className="text-2xl">Backoffice</CardTitle>
            <CardDescription>
              Inicia sesión para administrar partners y operaciones
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="tu@correo.com"
                {...form.register("username")}
              />
              {form.formState.errors.username ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.username.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión…" : "Iniciar sesión"}
            </Button>
          </form>

          <p className="text-muted-foreground mt-4 text-center text-sm">
            <Link
              to={PATHS.recoverPassword}
              className="text-primary font-medium hover:underline"
            >
              Olvidé mi contraseña
            </Link>
          </p>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(sessionConflict)}
        onOpenChange={(open) => !open && dismissConflict()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sesión activa detectada</DialogTitle>
            <DialogDescription>
              Ya hay una sesión abierta
              {sessionConflict?.ip ? ` desde ${sessionConflict.ip}` : ""}
              {sessionConflict?.agent ? ` (${sessionConflict.agent})` : ""}.
              ¿Deseas cerrarla e iniciar aquí?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={dismissConflict}>
              Cancelar
            </Button>
            <Button onClick={forceLogin} disabled={isLoading}>
              Continuar de todos modos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

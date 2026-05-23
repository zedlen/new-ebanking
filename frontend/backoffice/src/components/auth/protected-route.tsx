import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth-store";
import { PATHS } from "@/lib/constants";

export function ProtectedRoute() {
  const session = useAuthStore((s) => s.session);
  const hydrated = useAuthStore((s) => s.hydrated);
  const location = useLocation();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando sesión…</p>
      </div>
    );
  }

  if (!session?.token) {
    return <Navigate to={PATHS.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

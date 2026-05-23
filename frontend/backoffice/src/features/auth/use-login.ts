import { useState } from "react";
import {
  extractSessionConflict,
  fetchAuthUser,
  login,
} from "@/features/auth/auth-api";
import { useAuthStore } from "@/features/auth/auth-store";
import type { ActiveSessionConflict, LoginCredentials } from "@/types/auth";

const LOGIN_ERRORS: Record<number, string> = {
  401: "Usuario o contraseña incorrectos. Verifica tus datos o usa «Olvidé mi contraseña».",
  409: "Hay una sesión activa en otro dispositivo.",
  500: "No pudimos procesar tu solicitud. Intenta más tarde.",
};

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionConflict, setSessionConflict] =
    useState<ActiveSessionConflict | null>(null);
  const [pendingCredentials, setPendingCredentials] =
    useState<LoginCredentials | null>(null);

  const submit = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    setSessionConflict(null);

    const response = await login(credentials);

    if (response.code === 200 && response.data?.token) {
      const profile = await fetchAuthUser(response.data.token);
      if (!profile) {
        setError(LOGIN_ERRORS[500]);
        setIsLoading(false);
        return false;
      }

      setSession({ token: response.data.token, profile });
      setIsLoading(false);
      return true;
    }

    const conflict = extractSessionConflict(response);
    if (conflict && !credentials.forced) {
      setSessionConflict(conflict);
      setPendingCredentials(credentials);
      setIsLoading(false);
      return false;
    }

    setError(LOGIN_ERRORS[response.code] ?? LOGIN_ERRORS[401]);
    setIsLoading(false);
    return false;
  };

  const forceLogin = async () => {
    if (!pendingCredentials) return false;
    return submit({ ...pendingCredentials, forced: true });
  };

  const dismissConflict = () => {
    setSessionConflict(null);
    setPendingCredentials(null);
  };

  return {
    isLoading,
    error,
    sessionConflict,
    submit,
    forceLogin,
    dismissConflict,
  };
}

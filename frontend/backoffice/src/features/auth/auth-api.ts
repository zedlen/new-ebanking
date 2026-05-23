import { apiGet, apiPost } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ActiveSessionConflict,
  LoginCredentials,
  LoginResponse,
  UserProfile,
} from "@/types/auth";

interface AuthUserResponse {
  data?: UserProfile;
}

interface LoginApiBody {
  data?: LoginResponse["data"];
  code?: number;
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  try {
    const body = await apiPost<LoginApiBody>(endpoints.auth.login, {...credentials, module: "backoffice"});
    return {
      status: "ok",
      code: body.code ?? 200,
      data: body.data ?? { token: "" },
    };
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status: number; data?: LoginApiBody };
    };

    if (axiosError.response) {
      const payload = axiosError.response.data;
      return {
        status: "error",
        code: axiosError.response.status,
        data: payload?.data ?? { token: "" },
      };
    }

    return {
      status: "error",
      code: 500,
      data: { token: "" },
    };
  }
}

export function extractSessionConflict(
  response: LoginResponse,
): ActiveSessionConflict | null {
  if (response.code !== 409) return null;
  const session =
    response.data?.session ?? response.data?.data?.session ?? null;
  if (!session?.ip && !session?.agent) return null;
  return session;
}

export async function fetchAuthUser(token: string): Promise<UserProfile | null> {
  try {
    const data = await apiGet<AuthUserResponse>(endpoints.auth.authuser, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiPost(endpoints.auth.logout, {});
  } catch {
    // Session is cleared locally regardless
  }
}

export async function requestOtpLinkCard(): Promise<boolean> {
  try {
    const data = await apiPost<{ code?: number }>(endpoints.auth.otpLinkCard, {});
    return data.code === 200;
  } catch {
    return false;
  }
}

export async function requestOtpCancelCard(): Promise<boolean> {
  try {
    const data = await apiPost<{ code?: number }>(
      endpoints.auth.otpCancelCard,
      {},
    );
    return data.code === 200;
  } catch {
    return false;
  }
}

export async function recoverPassword(
  elementId: string,
  isCustomer = false,
): Promise<boolean> {
  const body = isCustomer
    ? { customerId: elementId }
    : { email: elementId };

  try {
    await apiPost(endpoints.auth.recoverPass, body);
    return true;
  } catch {
    return false;
  }
}

import { isAxiosError } from "axios";
import { apiGet, apiPost } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import {
  AffiliationCodeError,
  type AffiliationCodeResponse,
  type RegistrationPayload,
} from "@/types/registration";

export interface CreateEntityResult {
  success: boolean;
  error?: string | null;
}

function parseCreateError(error: unknown): string | null {
  if (!isAxiosError(error)) return null;
  const data = error.response?.data as
    | { error?: string; data?: { issues?: Array<{ path?: string[]; code?: string }> } }
    | undefined;
  const issue = data?.data?.issues?.[0];
  if (issue?.code) {
    return `${issue.path?.[0] ?? "campo"}: ${issue.code}`;
  }
  return data?.error ?? null;
}

export async function validateAffiliationCode(
  code: string,
): Promise<AffiliationCodeResponse> {
  try {
    return await apiGet<AffiliationCodeResponse>(
      `${endpoints.affiliationCode}/validate?code=${encodeURIComponent(code)}`,
    );
  } catch {
    return {
      code: AffiliationCodeError.Invalid,
      isValid: false,
    };
  }
}

export async function createPartner(
  body: RegistrationPayload,
): Promise<CreateEntityResult> {
  try {
    await apiPost(endpoints.partners, body);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseCreateError(error) };
  }
}

export async function createCustomer(
  partnerId: string,
  body: RegistrationPayload,
): Promise<CreateEntityResult> {
  try {
    await apiPost(`${endpoints.partners}/${partnerId}/customers`, body);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseCreateError(error) };
  }
}

export async function createWallet(
  partnerId: string,
  customerId: string,
  body: RegistrationPayload,
): Promise<CreateEntityResult> {
  try {
    await apiPost(
      `${endpoints.partners}/${partnerId}/customers/${customerId}/wallets`,
      body,
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: parseCreateError(error) };
  }
}

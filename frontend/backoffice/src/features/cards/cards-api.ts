import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  CardAccountBundle,
  ChangeCardStatusBody,
  LinkCardBody,
} from "@/types/cards";

export interface CardsContext {
  partnerId: string;
  customerId: string;
  walletId?: string;
}

interface ApiCodeResponse {
  code?: number;
}

function cardsPath(ctx: CardsContext): string {
  if (ctx.walletId) {
    return `${endpoints.partners}/${ctx.partnerId}/customers/${ctx.customerId}/wallets/${ctx.walletId}/cards`;
  }
  return `${endpoints.partners}/${ctx.partnerId}/customers/${ctx.customerId}/cards`;
}

export async function fetchCards(ctx: CardsContext): Promise<CardAccountBundle[]> {
  try {
    return (await apiGet<CardAccountBundle[]>(cardsPath(ctx))) ?? [];
  } catch {
    return [];
  }
}

export async function changeCardStatus(
  ctx: CardsContext,
  cardId: string,
  body: ChangeCardStatusBody,
): Promise<boolean> {
  try {
    const data = await apiPatch<ApiCodeResponse>(
      `${cardsPath(ctx)}/${cardId}`,
      body,
    );
    return data.code === 200;
  } catch {
    return false;
  }
}

export async function linkCard(
  ctx: CardsContext,
  body: LinkCardBody,
  otp: string,
): Promise<boolean> {
  try {
    const data = await apiPost<ApiCodeResponse>(cardsPath(ctx), body, {
      headers: { OTP_CODE: otp },
    });
    return data.code === 200;
  } catch {
    return false;
  }
}

export async function cancelCard(
  ctx: CardsContext,
  cardId: string,
  body: ChangeCardStatusBody,
  otp: string,
): Promise<boolean> {
  try {
    const data = await apiPatch<ApiCodeResponse>(
      `${cardsPath(ctx)}/${cardId}`,
      body,
      { headers: { OTP_CODE: otp } },
    );
    return data.code === 200;
  } catch {
    return false;
  }
}

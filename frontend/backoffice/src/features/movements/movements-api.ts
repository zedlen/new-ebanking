import { downloadFile, apiGet } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  MovementContext,
  MovementDetail,
  MovementsResponse,
} from "@/types/movements";

export function buildMovementBasePath(ctx: MovementContext): string {
  const { partnerId, customerId, walletId, accountId } = ctx;
  if (customerId && walletId) {
    return `${endpoints.partners}/${partnerId}/customers/${customerId}/wallets/${walletId}/accounts/${accountId}`;
  }
  if (customerId) {
    return `${endpoints.partners}/${partnerId}/customers/${customerId}/accounts/${accountId}`;
  }
  return `${endpoints.partners}/${partnerId}/accounts/${accountId}`;
}

const emptyResponse = (): MovementsResponse => ({
  total: 0,
  data: [],
  info: { balance: 0, image: "", name: "" },
});

export async function fetchMovements(
  ctx: MovementContext,
  offset: number,
  limit: number,
  query = "",
): Promise<MovementsResponse> {
  try {
    const q = query ? `&query=${encodeURIComponent(query)}` : "";
    return await apiGet<MovementsResponse>(
      `${buildMovementBasePath(ctx)}/movements?offset=${offset}&limit=${limit}${q}`,
    );
  } catch {
    return emptyResponse();
  }
}

export async function fetchMovementDetail(
  ctx: MovementContext,
  movId: string,
): Promise<MovementDetail | null> {
  try {
    return await apiGet<MovementDetail>(
      `${buildMovementBasePath(ctx)}/movements/${movId}`,
    );
  } catch {
    return null;
  }
}

export async function downloadMovementVoucher(
  ctx: MovementContext,
  movId: string,
): Promise<void> {
  await downloadFile(
    `${buildMovementBasePath(ctx)}/movements/${movId}/boucher`,
    `Movimiento_${movId}.pdf`,
    { timeout: 60_000 },
  );
}

export async function downloadMovementsReport(
  ctx: MovementContext,
  startDate: string,
  endDate: string,
): Promise<void> {
  await downloadFile(
    `${buildMovementBasePath(ctx)}/movement-report?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
    `Movimientos_${startDate}_a_${endDate}.xlsx`,
    { timeout: 60_000 },
  );
}

export function movementListQueryKey(
  ctx: MovementContext,
  page: number,
  size: number,
  query: string,
) {
  return [
    "movements",
    ctx.partnerId,
    ctx.customerId,
    ctx.walletId,
    ctx.accountId,
    page,
    size,
    query,
  ] as const;
}

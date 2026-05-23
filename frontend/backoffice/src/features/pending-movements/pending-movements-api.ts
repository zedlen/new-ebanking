import {
  MOCK_PENDING_MOVEMENT_DETAIL,
  MOCK_PENDING_MOVEMENTS,
} from "@/features/pending-movements/mocks/pending-movements-mocks";
import type { MovementDetail, MovementListItem } from "@/types/movements";

export interface PendingMovementsResponse {
  total: number;
  data: MovementListItem[];
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchPendingMovements(
  offset: number,
  limit: number,
): Promise<PendingMovementsResponse> {
  await delay(200);
  return {
    total: MOCK_PENDING_MOVEMENTS.length,
    data: MOCK_PENDING_MOVEMENTS.slice(offset, offset + limit),
  };
}

export async function fetchPendingMovementDetail(
  _id: string,
): Promise<MovementDetail> {
  await delay(300);
  return MOCK_PENDING_MOVEMENT_DETAIL;
}

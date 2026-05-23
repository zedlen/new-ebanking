import { describe, expect, it } from "vitest";
import {
  fetchPendingMovementDetail,
  fetchPendingMovements,
} from "@/features/pending-movements/pending-movements-api";
import { MOCK_PENDING_MOVEMENTS } from "@/features/pending-movements/mocks/pending-movements-mocks";

describe("pending movements API (mock)", () => {
  it("returns paginated mock list", async () => {
    const res = await fetchPendingMovements(0, 3);
    expect(res.total).toBe(MOCK_PENDING_MOVEMENTS.length);
    expect(res.data).toHaveLength(3);
  });

  it("returns mock detail", async () => {
    const detail = await fetchPendingMovementDetail("any-id");
    expect(detail.payer_name).toBe("LIVING ROCK DIGITAL");
    expect(detail.beneficiary_name).toBe("GEMTRANSFER");
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
}));

import { apiGet, apiPost, apiPatch } from "@/lib/api/client";
import {
  cancelCard,
  changeCardStatus,
  fetchCards,
  linkCard,
} from "@/features/cards/cards-api";

const ctx = { partnerId: "p1", customerId: "c1" };
const walletCtx = { ...ctx, walletId: "w1" };

describe("cards API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchCards returns empty array on error", async () => {
    vi.mocked(apiGet).mockRejectedValue(new Error("fail"));
    await expect(fetchCards(ctx)).resolves.toEqual([]);
  });

  it("fetchCards uses wallet path when walletId set", async () => {
    vi.mocked(apiGet).mockResolvedValue([]);
    await fetchCards(walletCtx);
    expect(apiGet).toHaveBeenCalledWith(
      expect.stringContaining("/wallets/w1/cards"),
    );
  });

  it("changeCardStatus returns true when code is 200", async () => {
    vi.mocked(apiPatch).mockResolvedValue({ code: 200 });
    const ok = await changeCardStatus(ctx, "card-1", {
      status: "BLOCKED",
      statusReason: "OTHER",
    });
    expect(ok).toBe(true);
  });

  it("linkCard sends OTP header", async () => {
    vi.mocked(apiPost).mockResolvedValue({ code: 200 });
    const ok = await linkCard(
      ctx,
      { pan: "4111111111111111", accountId: "acc-1" },
      "123456",
    );
    expect(ok).toBe(true);
    expect(apiPost).toHaveBeenCalledWith(
      expect.stringContaining("/customers/c1/cards"),
      expect.any(Object),
      expect.objectContaining({ headers: { OTP_CODE: "123456" } }),
    );
  });

  it("cancelCard sends OTP header on patch", async () => {
    vi.mocked(apiPatch).mockResolvedValue({ code: 200 });
    const ok = await cancelCard(
      ctx,
      "card-1",
      { status: "CANCELED", statusReason: "THEFT" },
      "654321",
    );
    expect(ok).toBe(true);
    expect(apiPatch).toHaveBeenCalledWith(
      expect.stringContaining("/cards/card-1"),
      expect.any(Object),
      expect.objectContaining({ headers: { OTP_CODE: "654321" } }),
    );
  });
});

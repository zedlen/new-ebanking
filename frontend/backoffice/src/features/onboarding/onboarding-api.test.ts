import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

import { apiGet, apiPost } from "@/lib/api/client";
import {
  approveProspect,
  fetchOnboardings,
  rejectProspect,
} from "@/features/onboarding/onboarding-api";

describe("onboarding API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchOnboardings returns empty on error", async () => {
    vi.mocked(apiGet).mockRejectedValue(new Error("fail"));
    await expect(fetchOnboardings(0, 10)).resolves.toEqual({
      total: 0,
      data: [],
    });
  });

  it("approveProspect posts to approve endpoint", async () => {
    vi.mocked(apiPost).mockResolvedValue({});
    const ok = await approveProspect("uuid-1");
    expect(ok).toBe(true);
    expect(apiPost).toHaveBeenCalledWith(
      expect.stringContaining("/onboardings/uuid-1/approve"),
      {},
    );
  });

  it("rejectProspect sends rejection_reason", async () => {
    vi.mocked(apiPost).mockResolvedValue({});
    const ok = await rejectProspect("uuid-1", "Documentación incompleta");
    expect(ok).toBe(true);
    expect(apiPost).toHaveBeenCalledWith(
      expect.stringContaining("/reject"),
      { rejection_reason: "Documentación incompleta" },
    );
  });
});

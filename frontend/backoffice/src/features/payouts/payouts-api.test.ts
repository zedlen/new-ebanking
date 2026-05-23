import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/client", () => ({
  apiClient: { post: vi.fn() },
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

import { apiGet, apiPost } from "@/lib/api/client";
import {
  buildPayoutFormData,
  PAYOUT_CLIENT,
  processPayoutFile,
} from "@/features/payouts/payouts-api";

describe("payouts API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("buildPayoutFormData uses zeuspay client", () => {
    const file = new File(["a"], "test.csv", { type: "text/csv" });
    const form = buildPayoutFormData(file, { recipients: ["a@test.com"] });
    expect(form.get("client")).toBe(PAYOUT_CLIENT);
    expect(form.get("recipients")).toBe("a@test.com");
  });

  it("processPayoutFile returns null on invalid response", async () => {
    vi.mocked(apiPost).mockResolvedValue({});
    await expect(processPayoutFile(new File([], "x.csv"))).resolves.toBeNull();
  });

  it("processPayoutFile returns data when valid", async () => {
    vi.mocked(apiPost).mockResolvedValue({
      dayGrouping: { "2024-01-01": { total: "10", records: [] } },
      ignoredRecords: [],
      total: "10",
    });
    const result = await processPayoutFile(new File([], "x.csv"));
    expect(result?.total).toBe("10");
  });

  it("fetchPayoutHistory returns array", async () => {
    const { fetchPayoutHistory } = await import("@/features/payouts/payouts-api");
    vi.mocked(apiGet).mockResolvedValue([{ date: "2024-01-01", results: [] }]);
    const data = await fetchPayoutHistory("2024-01-01", "2024-01-31");
    expect(data).toHaveLength(1);
  });
});

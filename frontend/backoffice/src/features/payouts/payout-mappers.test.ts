import { describe, expect, it } from "vitest";
import {
  appendCollateralTotalRow,
  collateralAmount,
  collateralDailyAverage,
  isValidProcessPayoutResponse,
  sumPayoutHistoryTotal,
  sumMonthlyRows,
} from "@/features/payouts/payout-mappers";
import type { ProcessPayoutsResponse } from "@/types/payouts";

describe("payout mappers", () => {
  it("validates process payout response shape", () => {
    const valid: ProcessPayoutsResponse = {
      dayGrouping: { "2024-01-01": { total: "100", records: [] } },
      ignoredRecords: [],
      total: "100",
    };
    expect(isValidProcessPayoutResponse(valid)).toBe(true);
    expect(isValidProcessPayoutResponse(null)).toBe(false);
  });

  it("sums payout history totals", () => {
    expect(
      sumPayoutHistoryTotal([
        {
          date: "2024-01-01",
          results: [{ total: 10 }, { total: 5 }],
        },
        { date: "2024-01-02", results: [{ total: 20 }] },
      ]),
    ).toBe(35);
  });

  it("sums monthly rows", () => {
    expect(sumMonthlyRows([{ total: 100 }, { total: 50 }])).toBe(150);
  });

  it("appends collateral TOTAL row", () => {
    const rows = appendCollateralTotalRow(
      [
        { customer_name: "A", total: 100 },
        { customer_name: "B", total: 50 },
      ],
      "2024-05",
    );
    expect(rows.at(-1)?.customer_name).toBe("TOTAL");
    expect(rows.at(-1)?.total).toBe(150);
  });

  it("calculates collateral from daily average", () => {
    expect(collateralDailyAverage(700, 7)).toBe(100);
    expect(collateralAmount(700, 7, 7)).toBe(700);
  });
});

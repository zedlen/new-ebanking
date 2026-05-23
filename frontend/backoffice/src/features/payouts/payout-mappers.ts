import type {
  CollateralReportRow,
  PayoutHistoryDay,
  ProcessPayoutsResponse,
} from "@/types/payouts";

export function isValidProcessPayoutResponse(
  data: unknown,
): data is ProcessPayoutsResponse {
  if (!data || typeof data !== "object") return false;
  const r = data as ProcessPayoutsResponse;
  return Boolean(r.total && r.dayGrouping);
}

export function sumPayoutHistoryTotal(days: PayoutHistoryDay[]): number {
  return days.reduce(
    (sum, day) =>
      sum + day.results.reduce((daySum, entry) => daySum + entry.total, 0),
    0,
  );
}

export function sumMonthlyRows(rows: Array<{ total: number }>): number {
  return rows.reduce((sum, row) => sum + row.total, 0);
}

export function appendCollateralTotalRow(
  rows: CollateralReportRow[],
  monthLabel: string,
): CollateralReportRow[] {
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  return [
    ...rows,
    {
      month: monthLabel,
      customer_name: "TOTAL",
      total,
    },
  ];
}

export function collateralDailyAverage(
  total: number,
  daysInPeriod: number,
): number {
  if (daysInPeriod <= 0) return 0;
  return total / daysInPeriod;
}

export function collateralAmount(
  total: number,
  daysInPeriod: number,
  collateralDays: number,
): number {
  return collateralDailyAverage(total, daysInPeriod) * collateralDays;
}

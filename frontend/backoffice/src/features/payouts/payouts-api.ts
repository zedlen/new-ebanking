import { apiClient, apiGet, apiPost } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { env } from "@/lib/env";
import { isValidProcessPayoutResponse } from "@/features/payouts/payout-mappers";
import type {
  CollateralReportRow,
  PayoutHistoryDay,
  PayoutMonthlyRow,
  ProcessPayoutsResponse,
} from "@/types/payouts";

export const PAYOUT_CLIENT = env.appName;

export function buildPayoutFormData(
  file: File,
  options?: { recipients?: string[] },
): FormData {
  const form = new FormData();
  form.append("file", file);
  form.append("client", PAYOUT_CLIENT);
  if (options?.recipients?.length) {
    form.append("recipients", options.recipients.join(","));
  }
  return form;
}

export async function processPayoutFile(
  file: File,
): Promise<ProcessPayoutsResponse | null> {
  try {
    const body = buildPayoutFormData(file);
    const data = await apiPost<ProcessPayoutsResponse>(
      `${endpoints.cards}/payout`,
      body,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return isValidProcessPayoutResponse(data) ? data : null;
  } catch {
    return null;
  }
}

export async function sendPayoutFileReport(
  file: File,
  recipients: string[],
): Promise<boolean> {
  try {
    const body = buildPayoutFormData(file, { recipients });
    const { saveAs } = await import("file-saver");
    const response = await apiClient.post<ArrayBuffer>(
      `${endpoints.cards}/payout-report`,
      body,
      {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "arraybuffer",
        timeout: env.apiTimeout,
      },
    );
    const contentType =
      (response.headers["content-type"] as string) ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const blob = new Blob([response.data], { type: contentType });
    saveAs(blob, "Reporte de Movimientos.xlsx");
    return true;
  } catch {
    return false;
  }
}

export async function fetchPayoutHistory(
  from: string,
  to: string,
): Promise<PayoutHistoryDay[]> {
  try {
    const data = await apiGet<PayoutHistoryDay[]>(
      `${endpoints.cards}/payout/history?from=${from}&to=${to}`,
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchPayoutMonthly(
  from: string,
  to: string,
): Promise<PayoutMonthlyRow[]> {
  try {
    const data = await apiGet<PayoutMonthlyRow[]>(
      `${endpoints.cards}/payout/monthly?from=${from}&to=${to}`,
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchCollateralMonthReport(
  from: string,
  to: string,
): Promise<CollateralReportRow[]> {
  try {
    const data = await apiGet<CollateralReportRow[]>(
      `${endpoints.cards}/charges/monthly?from=${from}&to=${to}`,
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

import { apiClient } from "@/api/client";
import { URL_API } from "@/api/endpoints";
import type {
  ApiResult,
  BulkSpeiPreviewRow,
  InternalTransferRequest,
  PendingTransfer,
} from "@/shared/types/transfers";

const otpHeaders = (otp: string) => ({
  headers: { "Kubit-OTP": `OTP ${otp}` },
});

function mapResult(data: {
  code?: number;
  message?: string;
  data?: unknown;
}): ApiResult {
  return {
    code: data.code ?? 500,
    message: data.message,
    data: data.data,
  };
}

function mapError(error: unknown): ApiResult {
  if (error && typeof error === "object" && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: { code?: number; message?: string; data?: unknown };
        };
      }
    ).response;
    return {
      code: response?.data?.code ?? 500,
      message: response?.data?.message,
      data: response?.data?.data,
    };
  }
  return { code: 500 };
}

export const transfersService = {
  async getPendingTransfers(statusId: string): Promise<PendingTransfer[]> {
    try {
      const { data } = await apiClient.get<{ data?: PendingTransfer[] }>(
        `${URL_API.TRANSFERS.PENDING}?status=${statusId}`,
      );
      return data.data ?? [];
    } catch {
      return [];
    }
  },

  async approvePendingTransfers(
    selectedOrderIds: string[],
    otp: string,
  ): Promise<ApiResult> {
    try {
      const { data } = await apiClient.post(
        URL_API.TRANSFERS.PENDING_APPROVE,
        { selected_order_ids: selectedOrderIds },
        otpHeaders(otp),
      );
      return mapResult(data as { code?: number; message?: string });
    } catch (error) {
      return mapError(error);
    }
  },

  async sendTransfer(
    body: InternalTransferRequest,
    otp: string,
  ): Promise<ApiResult> {
    try {
      const { data } = await apiClient.post(
        URL_API.TRANSFERS.SEND,
        body,
        otpHeaders(otp),
      );
      return mapResult(data as { code?: number; message?: string });
    } catch (error) {
      return mapError(error);
    }
  },

  async saveTransfer(
    body: InternalTransferRequest,
    otp: string,
  ): Promise<ApiResult> {
    try {
      const { data } = await apiClient.post(
        `${URL_API.TRANSFERS.SEND}/save`,
        body,
        otpHeaders(otp),
      );
      return mapResult(data as { code?: number; message?: string });
    } catch (error) {
      return mapError(error);
    }
  },

  async getPendingDispersions(statusId: string): Promise<PendingTransfer[]> {
    try {
      const { data } = await apiClient.get<{ data?: PendingTransfer[] }>(
        `${URL_API.TRANSFERS.DISPERSIONS_PENDING}?status=${statusId}`,
      );
      return data.data ?? [];
    } catch {
      return [];
    }
  },

  async approvePendingDispersions(
    selectedTransferIds: string[],
    otp: string,
  ): Promise<ApiResult> {
    try {
      const { data } = await apiClient.post(
        URL_API.TRANSFERS.DISPERSIONS_PENDING_APPROVE,
        { selected_transfer_ids: selectedTransferIds },
        otpHeaders(otp),
      );
      return mapResult(data as { code?: number; message?: string });
    } catch (error) {
      return mapError(error);
    }
  },

  async sendDispersion(
    body: InternalTransferRequest,
    otp: string,
  ): Promise<ApiResult> {
    try {
      const { data } = await apiClient.post(
        URL_API.TRANSFERS.SEND,
        body,
        otpHeaders(otp),
      );
      return mapResult(data as { code?: number; message?: string });
    } catch (error) {
      return mapError(error);
    }
  },

  async sendDispersionMassive(
    formData: FormData,
    otp: string,
  ): Promise<ApiResult> {
    try {
      const { data } = await apiClient.post(
        URL_API.TRANSFERS.DISPERSION_TEMPLATE,
        formData,
        {
          headers: {
            ...otpHeaders(otp).headers,
            "Content-Type": "multipart/form-data",
          },
          timeout: 60_000,
        },
      );
      return mapResult(
        data as { code?: number; message?: string; data?: unknown },
      );
    } catch (error) {
      return mapError(error);
    }
  },

  async previewBulkDispersion(
    formData: FormData,
  ): Promise<BulkSpeiPreviewRow[]> {
    try {
      const { data } = await apiClient.post(
        `${URL_API.SPEI.BULK}/preview`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60_000,
        },
      );
      return data as BulkSpeiPreviewRow[];
    } catch (error) {
      return [];
    }
  },
};

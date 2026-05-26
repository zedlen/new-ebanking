import { apiClient } from '@/api/client'
import { URL_API } from '@/api/endpoints'
import type {
  ApiResult,
  Bank,
  BulkSpeiPreviewRow,
  SpeiTransferRequest,
} from '@/shared/types/transfers'

const otpHeaders = (otp: string) => ({
  headers: { 'Kubit-OTP': `OTP ${otp}` },
})

function mapResult(data: { code?: number; message?: string }): ApiResult {
  return {
    code: data.code ?? 500,
    message: data.message,
  }
}

function mapError(error: unknown): ApiResult {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { code?: number; message?: string } } })
      .response
    return {
      code: response?.data?.code ?? 500,
      message: response?.data?.message,
    }
  }
  return { code: 500 }
}

export const speiService = {
  async getBanks(): Promise<Bank[]> {
    try {
      const { data } = await apiClient.get<{ data?: Bank[] }>(URL_API.SPEI.BANKS)
      return data.data ?? []
    } catch {
      return []
    }
  },

  async sendSpei(body: SpeiTransferRequest, otp: string): Promise<ApiResult> {
    try {
      const { data } = await apiClient.post(URL_API.SPEI.SEND, body, otpHeaders(otp))
      return mapResult(data as { code?: number; message?: string })
    } catch (error) {
      return mapError(error)
    }
  },

  async saveSpei(body: SpeiTransferRequest, otp: string): Promise<ApiResult> {
    try {
      const { data } = await apiClient.post(
        `${URL_API.SPEI.SEND}/save`,
        body,
        otpHeaders(otp),
      )
      return mapResult(data as { code?: number; message?: string })
    } catch (error) {
      return mapError(error)
    }
  },

  /** Mock preview until backend parse endpoint exists. */
    async previewBulkSpei(formData: FormData): Promise<BulkSpeiPreviewRow[]> {
      try {
        const { data } = await apiClient.post(`${URL_API.SPEI.BULK}/preview`, formData, {
          headers:{
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60_000,
        })
        return data as BulkSpeiPreviewRow[]
      } catch (error) {
        return []
      }
    },
  
    async sendSpeiMassive(formData: FormData, otp: string): Promise<ApiResult> {      
      try {
        const { data } = await apiClient.post(URL_API.SPEI.BULK, formData, {
          headers:{
            ...otpHeaders(otp).headers,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60_000,
        })
        return mapResult(data as { code?: number; message?: string; data?: unknown })
      } catch (error) {
        return mapError(error)
      }
    },
  
}

import { apiClient } from '@/api/client'
import { URL_API } from '@/api/endpoints'
import type {
  Affiliation,
  AffiliationRequest,
  AffiliationRequestUpdate,
  AffiliationsListResponse,
} from '@/shared/types/affiliations'
import { getCustomerDisplayName } from '@/shared/utils/customer'

function mapAffiliationRows(items: Affiliation[]): Affiliation[] {
  return items.map((item) => ({
    ...item,
    field_name: getCustomerDisplayName(item),
  }))
}

export const affiliationsService = {
  async list(
    offset: number,
    limit: number,
    query?: string,
  ): Promise<AffiliationsListResponse> {
    try {
      const search = query?.trim()
        ? `&query=${encodeURIComponent(query.trim())}`
        : ''
      const { data } = await apiClient.get<AffiliationsListResponse>(
        `${URL_API.AFFILIATIONS.LIST}?offset=${offset}&limit=${limit}${search}`,
        { timeout: 240_000 },
      )
      return {
        total: data.total ?? 0,
        data: mapAffiliationRows(data.data ?? []),
      }
    } catch {
      return { total: 0, data: [] }
    }
  },

  async sync(): Promise<boolean> {
    try {
      await apiClient.post(URL_API.AFFILIATIONS.SYNC, {}, { timeout: 240_000 })
      return true
    } catch {
      return false
    }
  },

  async getRequests(customerId: string): Promise<AffiliationRequest[]> {
    try {
      const { data } = await apiClient.get<{ data?: AffiliationRequest[] }>(
        URL_API.AFFILIATIONS.requests(customerId),
      )
      return data.data ?? []
    } catch {
      return []
    }
  },

  async approveRequest(
    customerId: string,
    requestId: string,
  ): Promise<{ id?: string; message?: string }> {
    try {
      const { data } = await apiClient.post<{ id?: string; message?: string }>(
        `${URL_API.AFFILIATIONS.requests(customerId)}/${requestId}/approve`,
        {},
      )
      return data
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string } } })
          .response
        return { message: response?.data?.message }
      }
      return { message: 'Error al aprobar la solicitud' }
    }
  },

  async rejectRequest(customerId: string, requestId: string): Promise<boolean> {
    try {
      const { data } = await apiClient.post<{ code?: number }>(
        `${URL_API.AFFILIATIONS.requests(customerId)}/${requestId}/reject`,
        {},
      )
      return data.code === 201 || data.code === 200
    } catch {
      return false
    }
  },

  async updateRequest(
    customerId: string,
    requestId: string,
    body: AffiliationRequestUpdate,
  ): Promise<{ code?: number; message?: string }> {
    try {
      const { data } = await apiClient.patch<{ code?: number; message?: string }>(
        `${URL_API.AFFILIATIONS.requests(customerId)}/${requestId}`,
        body,
      )
      return { code: data.code ?? 200, message: data.message }
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string } } })
          .response
        return { message: response?.data?.message, code: 500 }
      }
      return { code: 500 }
    }
  },
}

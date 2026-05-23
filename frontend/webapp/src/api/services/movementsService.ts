import { apiClient } from '@/api/client'
import { URL_API } from '@/api/endpoints'
import type { Movement, MovementsPagedResult } from '@/shared/types/movements'
import { buildMovementDateFilters } from '@/shared/utils/dates'
import { downloadBlob } from '@/shared/utils/download'

const accountPath = (template: string, accountId: string) =>
  template.replace('{accountId}', accountId)

export const movementsService = {
  async getLatest(accountId: string): Promise<Movement[]> {
    try {
      const { data } = await apiClient.get<Movement[]>(
        accountPath(URL_API.ACCOUNTS.MOVEMENTS_LATEST, accountId),
      )
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  async getPaged(params: {
    accountId: string
    limit: number
    page: number
    startDate?: string
    endDate?: string
  }): Promise<MovementsPagedResult> {
    try {
      const dateFilters = buildMovementDateFilters(
        params.startDate,
        params.endDate,
      )
      const url = `${accountPath(URL_API.ACCOUNTS.MOVEMENTS_PAGED, params.accountId)}?limit=${params.limit}&offset=${params.page}${dateFilters}`
      const { data } = await apiClient.get<{
        data?: Movement[]
        total?: number
      }>(url)
      return {
        data: data.data ?? [],
        total: data.total ?? 0,
      }
    } catch {
      return { data: [], total: 0 }
    }
  },

  async getCep(movementId: string): Promise<string | null> {
    try {
      const { data } = await apiClient.get<{ data?: string }>(
        `${URL_API.SPEI.SEND}/orders/${movementId}/cep`,
      )
      return data.data ?? null
    } catch {
      return null
    }
  },

  async downloadMonthlyReport(
    accountId: string,
    monthKey: string,
    label: string,
  ): Promise<boolean> {
    try {
      const [month, year] = monthKey.split(',')
      const { data, headers } = await apiClient.get<ArrayBuffer>(
        `${URL_API.MONTHLY_REPORT}/${accountId}?month=${month}&year=${year}`,
        { responseType: 'arraybuffer', timeout: 60_000 },
      )
      downloadBlob(
        data,
        `Estado de Movimientos ${label}.pdf`,
        (headers['content-type'] as string) || 'application/pdf',
      )
      return true
    } catch {
      return false
    }
  },

  async downloadMovementsReport(
    accountId: string,
    query = '',
  ): Promise<boolean> {
    try {
      const suffix = query ? `?${query}` : ''
      const { data, headers } = await apiClient.get<ArrayBuffer>(
        `${URL_API.MOVEMENTS_REPORT}/${accountId}${suffix}`,
        { responseType: 'arraybuffer', timeout: 60_000 },
      )
      downloadBlob(
        data,
        'Reporte de Movimientos.xlsx',
        (headers['content-type'] as string) ||
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      return true
    } catch {
      return false
    }
  },

  async downloadBoucher(
    customerId: string,
    movementId: string,
  ): Promise<boolean> {
    try {
      const { data, headers } = await apiClient.get<ArrayBuffer>(
        `${URL_API.MOVEMENTS}/${customerId}/${movementId}/boucher`,
        { responseType: 'arraybuffer', timeout: 60_000 },
      )
      downloadBlob(
        data,
        `Movimiento_${movementId}.pdf`,
        (headers['content-type'] as string) || 'application/pdf',
      )
      return true
    } catch {
      return false
    }
  },
}

import { apiClient } from '@/api/client'
import { URL_API } from '@/api/endpoints'
import type {
  AccountInfo,
  AccountsListApiResponse,
  AccountsListResponse,
} from '@/shared/types/accounts'

const emptyList = (): AccountsListResponse => ({
  accountsBalance: 0,
  nestedAccountsBalance: 0,
  currency: 'MXN',
  totalAccounts: 0,
  totalNestedAccounts: 0,
  accounts: [],
})

const mapResponse = (body: AccountsListApiResponse): AccountsListResponse => ({
  accountsBalance: body.globalBalance ?? 0,
  nestedAccountsBalance: body.nestedAccountsBalance ?? 0,
  currency: body.currency ?? 'MXN',
  totalAccounts: body.total ?? 0,
  totalNestedAccounts: body.totalNestedAccounts ?? 0,
  accounts: body.data ?? [],
})

export const accountsService = {
  async getById(accountId: string): Promise<AccountInfo | null> {
    try {
      const { data } = await apiClient.get<AccountInfo | { data?: AccountInfo }>(
        `${URL_API.ACCOUNTS.BASE}/${accountId}`,
      )
      if (data && typeof data === 'object' && 'data' in data && data.data) {
        return data.data
      }
      return data as AccountInfo
    } catch {
      return null
    }
  },

  async list(
    offset: number,
    limit: number,
  ): Promise<AccountsListResponse> {
    try {
      const { data } = await apiClient.get<AccountsListApiResponse>(
        URL_API.ACCOUNTS.ALL_V2,
        { params: { offset, limit } },
      )
      return mapResponse(data)
    } catch {
      return emptyList()
    }
  },

  async listByCustomer(customerId: string): Promise<AccountsListResponse> {
    try {
      const { data } = await apiClient.get<AccountsListApiResponse>(
        `${URL_API.ACCOUNTS.CUSTOMER_V2}/${customerId}`,
      )
      return mapResponse(data)
    } catch {
      return emptyList()
    }
  },

  async exportAccounts(): Promise<boolean> {
    try {
      const { data, headers } = await apiClient.get<ArrayBuffer>(
        URL_API.ACCOUNTS.EXPORT,
        {
          responseType: 'arraybuffer',
          timeout: 60_000,
        },
      )

      const contentType =
        (headers['content-type'] as string | undefined) ??
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

      const blob = new Blob([data], { type: contentType })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'Cuentas.xlsx'
      anchor.click()
      URL.revokeObjectURL(url)
      return true
    } catch {
      return false
    }
  },
}

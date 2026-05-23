import { apiClient } from '@/api/client'
import { URL_API } from '@/api/endpoints'
import type { Customer, CustomersListResponse } from '@/shared/types/customer'
import { getCustomerDisplayName } from '@/shared/utils/customer'
import type { TransferFavorite } from '@/shared/types/transfers'

function mapClientRows(items: Customer[]): Customer[] {
  return items.map((item) => {
    const children = item.customers?.data
      ? mapClientRows(item.customers.data)
      : undefined

    return {
      ...item,
      field_name: getCustomerDisplayName(item),
      customers: item.customers
        ? { ...item.customers, data: children ?? item.customers.data }
        : undefined,
    }
  })
}

export const customersService = {
  async list(offset: number, limit: number): Promise<CustomersListResponse> {
    try {
      const { data } = await apiClient.get<CustomersListResponse>(
        `${URL_API.CLIENTS}?offset=${offset}&limit=${limit}`,
      )
      return {
        total: data.total ?? 0,
        data: mapClientRows(data.data ?? []),
      }
    } catch {
      return { total: 0, data: [] }
    }
  },

  async listByParent(
    parentId: string,
    offset: number,
    limit: number,
  ): Promise<CustomersListResponse> {
    try {
      const { data } = await apiClient.get<CustomersListResponse>(
        `${URL_API.CLIENTS}/${parentId}?offset=${offset}&limit=${limit}`,
      )
      return {
        total: data.total ?? 0,
        data: mapClientRows(data.data ?? []),
      }
    } catch {
      return { total: 0, data: [] }
    }
  },

  async getById(customerId: string): Promise<Customer | null> {
    try {
      const { data } = await apiClient.get<{ data?: Customer } | Customer>(
        `${URL_API.CLIENTS}/${customerId}/data`,
      )
      if (data && typeof data === 'object' && 'data' in data) {
        return data.data ?? null
      }
      return data as Customer
    } catch {
      return null
    }
  },

  async getFavorites(customerId: string): Promise<TransferFavorite[]> {
    try {
      const { data } = await apiClient.get<{ data?: TransferFavorite[] }>(
        `${URL_API.ACCOUNTS.CUSTOMERS}/${customerId}/favorites`,
      )
      return data.data ?? []
    } catch {
      return []
    }
  },
}

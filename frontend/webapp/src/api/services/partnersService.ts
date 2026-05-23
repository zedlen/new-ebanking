import { apiClient } from '@/api/client'
import { URL_API } from '@/api/endpoints'
import type { Customer } from '@/shared/types/customer'

export const partnersService = {
  async getById(partnerId: string): Promise<Customer | null> {
    try {
      const { data } = await apiClient.get<{ data?: Customer }>(
        `${URL_API.PARTNERS}/${partnerId}`,
      )
      return data.data ?? null
    } catch {
      return null
    }
  },
}

import { apiClient } from '@/api/client'
import { URL_API } from '@/api/endpoints'
import type {
  Card,
  CardChangeStatus,
  EncryptedPayload,
  LinkCardRequest,
} from '@/shared/types/card'

function normalizeCard(item: Record<string, unknown>): Card {
  const nested = item.card as Card | undefined
  if (nested) {
    return {
      ...nested,
      account_id:
        nested.account_id ??
        (item.external_id as string | undefined) ??
        (item.id as string | undefined) ??
        '',
    }
  }
  return item as unknown as Card
}

export const cardsService = {
  async list(): Promise<Card[]> {
    try {
      const { data } = await apiClient.get<unknown[]>(URL_API.CARDS)
      if (!Array.isArray(data)) return []
      return data.map((item) => normalizeCard(item as Record<string, unknown>))
    } catch {
      return []
    }
  },

  async getCardData(cardId: string): Promise<EncryptedPayload> {
    try {
      const { data } = await apiClient.get<{ data?: EncryptedPayload }>(
        `${URL_API.CARDS}/${cardId}/data`,
      )
      return data.data ?? {}
    } catch {
      return {}
    }
  },

  async getDynamicCvv(cardId: string): Promise<EncryptedPayload | null> {
    try {
      const { data } = await apiClient.get<{ data?: EncryptedPayload }>(
        `${URL_API.CARDS}/${cardId}/cvv`,
      )
      return data.data ?? {}
    } catch {
      return null
    }
  },

  async generateDynamicCvv(cardId: string): Promise<EncryptedPayload> {
    try {
      const { data } = await apiClient.post<{ data?: EncryptedPayload }>(
        `${URL_API.CARDS}/${cardId}/cvv`,
        {},
      )
      return data.data ?? {}
    } catch {
      return {}
    }
  },

  async getPin(cardId: string): Promise<EncryptedPayload> {
    try {
      const { data } = await apiClient.get<{ data?: EncryptedPayload }>(
        `${URL_API.CARDS}/${cardId}/pin`,
      )
      return data.data ?? {}
    } catch {
      return {}
    }
  },

  async linkVirtual(body: LinkCardRequest): Promise<boolean> {
    try {
      const { data } = await apiClient.post<{ code?: number }>(
        `${URL_API.CARDS}/virtual`,
        body,
      )
      return data.code === 200
    } catch {
      return false
    }
  },

  async changeStatus(cardId: string, body: CardChangeStatus): Promise<boolean> {
    try {
      const { data } = await apiClient.patch<{ code?: number }>(
        `${URL_API.CARDS}/${cardId}`,
        body,
      )
      return data.code === 200
    } catch {
      return false
    }
  },

  async cancel(cardId: string, body: CardChangeStatus, otp: string): Promise<boolean> {
    try {
      const { data } = await apiClient.patch<{ code?: number }>(
        `${URL_API.CARDS}/${cardId}`,
        body,
        { headers: { OTP_CODE: otp } },
      )
      return data.code === 200
    } catch {
      return false
    }
  },
}

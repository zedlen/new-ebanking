import axios from 'axios'
import { apiClient, apiGet, apiPost } from '@/api/client'
import { URL_API } from '@/api/endpoints'
import type {
  ApiEnvelope,
  AuthMeResponse,
  LoginResponseData,
  UserProfile,
} from '@/shared/types/user'
import { mapAuthMeToProfile } from '@/shared/utils/authProfile'

export interface LoginRequest {
  username: string
  password: string
  pbk: string
  forced?: boolean
}

export interface LoginResult {
  ok: boolean
  status: number
  data?: LoginResponseData
  sessionConflict?: {
    ip: string
    agent: string
  }
}

export const authService = {
  /**
   * Loads the logged-in user (`GET /auth/me`).
   * Pass `bearer` from the login response when the session cookie is not yet available.
   */
  async getCurrentUser(bearer?: string): Promise<UserProfile | null> {
    try {
      const headers = bearer ? { Authorization: `Bearer ${bearer}` } : undefined
      const me = await apiGet<AuthMeResponse>(URL_API.AUTH.ME, { headers })
      return mapAuthMeToProfile(me)
    } catch {
      return null
    }
  },

  /** @deprecated Use `getCurrentUser`. */
  async getAuthUser(): Promise<UserProfile | null> {
    return this.getCurrentUser()
  },

  async login(request: LoginRequest): Promise<LoginResult> {
    try {
      const data = await apiPost<LoginResponseData>(URL_API.AUTH.LOGIN, {
        username: request.username,
        password: request.password,
        pbk: request.pbk,
        forced: request.forced ?? false,
        module: 'ebanking',
      })
      return { ok: true, status: 200, data }
    } catch (error) {
      if (!axios.isAxiosError(error) || !error.response) {
        return { ok: false, status: 500 }
      }

      const { status, data } = error.response
      const envelope = data as ApiEnvelope<{
        session?: { ip?: string; agent?: string }
      }>

      if (status === 409 && envelope?.data?.session) {
        return {
          ok: false,
          status,
          sessionConflict: {
            ip: envelope.data.session.ip ?? '',
            agent: envelope.data.session.agent ?? '',
          },
        }
      }

      return { ok: false, status }
    }
  },

  async logout(): Promise<void> {
    try {
      await apiPost(URL_API.AUTH.LOGOUT, {})
    } catch {
      // Session cookie cleared server-side when possible
    }
  },

  async recoverPassword(email: string): Promise<boolean> {
    try {
      await apiPost(URL_API.AUTH.RECOVER_PASSWORD, { email })
      return true
    } catch {
      return false
    }
  },

  async createOtpLinkCard(): Promise<boolean> {
    try {
      const { data } = await apiClient.post<{ code?: number }>(
        URL_API.AUTH.OTP_LINK_CARD,
        {},
      )
      return data.code === 200
    } catch {
      return false
    }
  },

  async changePassword(
    newPassword: string,
    otp: string,
  ): Promise<{ code: number; message?: string }> {
    try {
      const { data } = await apiClient.post<{ code?: number; message?: string }>(
        URL_API.AUTH.UPDATE_PASSWORD,
        { new_password: newPassword },
        { headers: { 'Kubit-OTP': `OTP ${otp}` } },
      )
      return { code: data.code ?? 200 }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const body = error.response.data as { code?: number; message?: string }
        return { code: body.code ?? error.response.status, message: body.message }
      }
      return { code: 500 }
    }
  },

  async enrollOtp(): Promise<{ qrcode?: string; id?: string } | string | null> {
    try {
      const data = await apiPost<{ qrcode?: string; id?: string } | string>(
        URL_API.AUTH.ENROLL,
        {},
      )
      return data ?? null
    } catch {
      return null
    }
  },

  async validateOtp(otp: string, thalosUserId?: string): Promise<boolean> {
    try {
      const query = thalosUserId ? `?thalosUserId=${thalosUserId}` : ''
      const { data } = await apiClient.post<{ code?: number }>(
        `${URL_API.AUTH.VALIDATE}${query}`,
        {},
        { headers: { 'Kubit-OTP': `OTP ${otp}` } },
      )
      return data.code === 200
    } catch {
      return false
    }
  },

  async createOtpCancelCard(): Promise<boolean> {
    try {
      const { data } = await apiClient.post<{ code?: number }>(
        URL_API.AUTH.OTP_CANCEL_CARD,
        {},
      )
      return data.code === 200
    } catch {
      return false
    }
  },
}

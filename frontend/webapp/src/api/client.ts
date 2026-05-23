import axios, { type AxiosRequestConfig } from 'axios'
import { v4 as uuid } from 'uuid'
import { PUBLIC_API_URLS, URL_API } from '@/api/endpoints'
import { env } from '@/shared/utils/env'
import { useSessionStore } from '@/shared/store/sessionStore'
import { unwrapApiData } from '@/shared/utils/apiResponse'

export const apiClient = axios.create({
  timeout: env.apiTimeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  config.headers.set('request-id', uuid())
  config.withCredentials = true

  const url = config.url ?? ''
  if (!PUBLIC_API_URLS.has(url)) {
    const token = useSessionStore.getState().token
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const url = error.config?.url ?? ''
    const isAuthFlow =
      url === URL_API.AUTH.LOGIN || url === URL_API.AUTH.ME

    if (!isAuthFlow && error.response?.status === 401) {
      const body = error.response.data
      const mentionsOtp =
        typeof body === 'string'
          ? body.includes('otp')
          : JSON.stringify(body ?? '').includes('otp')

      if (!mentionsOtp) {
        useSessionStore.getState().clearSession()
      }
    }

    return Promise.reject(error)
  },
)

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.get(url, config)
  return unwrapApiData<T>(data)
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.post(url, body, config)
  return unwrapApiData<T>(data)
}

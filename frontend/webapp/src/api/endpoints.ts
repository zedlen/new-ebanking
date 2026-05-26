import { apiV1, env } from '@/shared/utils/env'

export const URL_API = {
  AUTH: {
    LOGIN: `${apiV1}/auth/${env.appName}/${env.env}/sign-in`,
    LOGOUT: `${apiV1}/auth/sign-out`,
    ME: `${apiV1}/auth/me`,
    RECOVER_PASSWORD: `${apiV1}/auth/${env.appName}/${env.env}/recover-password`,
    ENROLL: `${apiV1}/auth/2fa/enroll`,
    VALIDATE: `${apiV1}/auth/2fa/validate`,
    UPDATE_PASSWORD: `${apiV1}/auth/password/update`,
    OTP_LINK_CARD: `${apiV1}/auth/generate-otp-code/link_card`,
    OTP_CANCEL_CARD: `${apiV1}/auth/generate-otp-code/cancel_card`,
  },
  CARDS: `${apiV1}/ebanking/cards`,
  ACCOUNTS: {
    BASE: `${apiV1}/ebanking/accounts`,
    CUSTOMERS: `${apiV1}/ebanking/accounts/customers`,
    ALL_V2: `${apiV1}/ebanking/accounts`,
    CUSTOMER_V2: `${apiV1}/ebanking/accounts/customer`,
    EXPORT: `${apiV1}/ebanking/accounts/file`,
    MOVEMENTS_LATEST: `${apiV1}/ebanking/movements/accounts/{accountId}/latest`,
    MOVEMENTS_PAGED: `${apiV1}/ebanking/movements/accounts/{accountId}/paged`,
  },
  SPEI: {
    SEND: `${apiV1}/ebanking/movements/spei`,
    BANKS: `${apiV1}/ebanking/movements/spei/banks`,
    BULK: `${apiV1}/ebanking/movements/spei/bulk`,
  },
  MONTHLY_REPORT: `${apiV1}/ebanking/monthly-report`,
  MOVEMENTS_REPORT: `${apiV1}/ebanking/movements-report`,
  MOVEMENTS: `${apiV1}/ebanking/movements`,
  TRANSFERS: {
    SEND: `${apiV1}/ebanking/movements/transfers`,
    PENDING: `${apiV1}/ebanking/movements/spei/orders/saved`,
    PENDING_APPROVE: `${apiV1}/ebanking/movements/spei/orders/saved/process`,
    DISPERSIONS_PENDING: `${apiV1}/ebanking/movements/transfers/saved`,
    DISPERSIONS_PENDING_APPROVE: `${apiV1}/ebanking/movements/transfers/saved/process`,
    DISPERSION_TEMPLATE: `${apiV1}/ebanking/movements/transfers/save/template`,
  },
  AFFILIATIONS: {
    LIST: `${apiV1}/ebanking/affiliations`,
    SYNC: `${apiV1}/ebanking/affiliations/sync`,
    requests: `${apiV1}/ebanking/affiliations/requests`,
  },
  CLIENTS: `${apiV1}/ebanking/customers`,
  PARTNERS: `${apiV1}/ebanking/partners`,
} as const

/** Routes that do not require an existing session cookie. */
export const PUBLIC_API_URLS = new Set<string>([
  URL_API.AUTH.LOGIN,
  URL_API.AUTH.RECOVER_PASSWORD,
])

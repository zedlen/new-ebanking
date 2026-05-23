export interface AuthMeAddress {
  id: number
  street: string
  num_ext: string
  num_int: string | null
  reference: string | null
  neighborhood: string
  district: string
  estate: string
  cp: string
}

/** Raw payload from `GET /ebanking/auth/me`. */
export interface AuthMeResponse {
  id: string
  external_id: string
  parent_id: string | null
  account_customer_id: string
  level: number
  rfc: string
  company_name: string | null
  name: string
  ap_paterno: string
  ap_materno: string
  taxpayer_type_id: number
  address_id: number
  address: AuthMeAddress
  contact_name: string
  contact_email: string
  contact_tel: string
  creation_date: string
  image: string
  customer_type: number
  email: string
  blocked: boolean
  username: string
  role_id: number
  otp?: string
  affiliation_code: string
  app: string
}

/** Address slice stored on the session profile (from `/auth/me`). */
export type UserProfileAddress = AuthMeAddress

/** Normalized session profile used across the app (from `GET /auth/me`). */
export interface UserProfile {
  customer_id: string
  customer_type: number
  id: string
  username: string
  taxpayer_type_id: number
  role_id: number
  external_id: string
  account_customer_id: string
  rfc: string
  name: string
  ap_paterno: string
  ap_materno: string
  company_name: string | null
  contact_name: string
  contact_email: string
  contact_tel: string
  email: string
  image: string
  address: UserProfileAddress
  creation_date: string
  level: number
  affiliation_code: string
}

export interface LoginResponseData {
  key?: string
  token?: string
}

export interface ApiEnvelope<T> {
  code?: number
  data: T
  message?: string
}

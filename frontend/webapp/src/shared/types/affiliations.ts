import type { AccountInfo } from '@/shared/types/accounts'

export interface AffiliationAddress {
  id?: number
  street: string
  num_ext: string
  num_int?: string | null
  reference?: string | null
  neighborhood: string
  district: string
  estate: string
  cp: string
}

export interface AffiliationCard {
  id: string
  type: string
  brand?: string
  active_function?: string
  masked_pan: string
  cardholder_name?: string
  product_type?: string
  account_id: string
  status?: string
  status_reason?: string | null
}

export interface Affiliation {
  id: string
  parent_id?: string
  account_customer_id?: string
  level?: number
  rfc?: string
  company_name?: string
  name?: string
  ap_paterno?: string
  ap_materno?: string
  taxpayer_type_id?: number
  contact_name?: string
  contact_email?: string
  contact_tel?: string
  creation_date?: string
  address?: AffiliationAddress
  account?: AccountInfo
  accounts?: AccountInfo & { cards?: AffiliationCard[] }
  cards?: AffiliationCard[]
  field_name?: string
}

/** Flattened row: one affiliation account with parent metadata. */
export interface AffiliationRow extends Affiliation {
  account: AccountInfo
  cards: AffiliationCard[]
}

export interface AffiliationsListResponse {
  total: number
  data: Affiliation[]
}

export type AffiliationRequestStatus = 'pending' | 'approved' | 'rejected'

export interface AffiliationRequest {
  id: string
  parent_id?: string
  rfc: string
  company_name?: string
  name: string
  ap_paterno: string
  ap_materno: string
  taxpayer_type_id: number
  address: AffiliationAddress
  contact_name: string
  contact_email: string
  contact_tel: string
  customer_type?: number
  status: AffiliationRequestStatus | string
}

export interface AffiliationRequestUpdate {
  name: string
  ap_paterno: string
  ap_materno: string
  contact_email: string
  contact_tel: string
  rfc: string
  isEnterprise: boolean
  address: Omit<AffiliationAddress, 'id'>
}

export interface DispersionPrefill {
  beneficiaryName: string
  beneficiaryEmail?: string
  beneficiaryAccount: string
  paymentType: '2'
}

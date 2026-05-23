export interface ClabeInfo {
  id: number
  payment_provider_id: number
  account_id: string
  clabe: string
}

export interface AccountInfo {
  id: string
  external_id?: string
  type: number
  amount: number
  currency: string
  linked_cellphone: string | null
  creation_date: string
  customer_id?: string
  clabes?: ClabeInfo[]
  alias?: string | null
  cards?: {
    id: string
    type: string
    masked_pan: string
    status?: string
    brand?: string
    account_id?: string
  }[]
}

export interface AccountsListResponse {
  accountsBalance: number
  nestedAccountsBalance: number
  currency: string
  totalAccounts: number
  totalNestedAccounts: number
  accounts: AccountInfo[]
}

export interface AccountsListApiResponse {
  globalBalance?: number
  nestedAccountsBalance?: number
  currency?: string
  total?: number
  totalNestedAccounts?: number
  data?: AccountInfo[]
}

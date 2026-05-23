export interface Movement {
  id: string
  account_id: string
  type: number
  description: string
  amount: number
  folio: string
  status: string
  operation_date: string
  application_date: string
  payment_purpose: string
  tracking_key?: string
}

export interface MovementsPagedResult {
  total: number
  data: Movement[]
}

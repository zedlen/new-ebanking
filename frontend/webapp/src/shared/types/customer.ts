export interface Customer {
  id?: string
  external_id?: string
  rfc?: string
  parent_id?: string | null
  company_name?: string
  name?: string
  ap_paterno?: string
  ap_materno?: string
  taxpayer_type_id: number
  contact_name?: string
  contact_email?: string
  contact_tel?: string
  affiliation_code?: string
  creation_date?: string
  field_name?: string
  customers?: {
    data: Customer[]
    total: number
  }
}

export interface CustomersListResponse {
  data: Customer[]
  total: number
}

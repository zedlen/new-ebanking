export type RegistrationType = 'legal_entity' | 'natural_person'
export type RegistrationStatus = 'pending' | 'approved' | 'rejected'

export interface RegistrationAddress {
  street: string
  extNum: string
  intNum?: string
  zipcode: string
  colony: string
}

export interface LegalEntityRegistrationInput extends RegistrationAddress {
  company: string
  rfc: string
  companyPhone: string
  personalPhone: string
  contactName: string
  email: string
  documents: string[]
}

export interface NaturalPersonRegistrationInput extends RegistrationAddress {
  name: string
  rfc: string
  companyPhone: string
  personalPhone: string
  contactName: string
  email: string
  otherFile?: string
  documents: string[]
}

export interface PendingRegistration {
  id: string
  type: RegistrationType
  status: RegistrationStatus
  createdAt: string
  displayName: string
  contactName: string
  email: string
  payload: LegalEntityRegistrationInput | NaturalPersonRegistrationInput
}

import type { TypePerson } from "@/types/partners";

export interface RegistrationAddress {
  street: string;
  num_ext: string;
  num_int?: string;
  neighborhood: string;
  district: string;
  estate: string;
  cp: string;
  reference?: string;
}

export interface RegistrationPayload {
  rfc?: string;
  company_name?: string;
  economic_activity?: string;
  business_activity?: string;
  taxpayer_type_id: TypePerson;
  address: RegistrationAddress;
  contact_name?: string;
  contact_email: string;
  contact_tel: string;
  company_tel?: string;
  affiliation_code?: string;
  name?: string;
  ap_paterno?: string;
  ap_materno?: string;
}

export enum AffiliationCodeError {
  Invalid = "invalid_code_format",
  InUse = "code_already_in_use",
}

export const AFFILIATION_CODE_MESSAGES: Record<AffiliationCodeError, string> = {
  [AffiliationCodeError.Invalid]: "El código no es válido",
  [AffiliationCodeError.InUse]: "El código ya está en uso",
};

export interface AffiliationCodeResponse {
  code: AffiliationCodeError;
  isValid: boolean;
}

export type RegistrationLayout =
  | "partners"
  | "customers"
  | "wallets"
  | "accounts";

/** Domain types for onboarding (replaces legacy Mongoose schemas). */

export enum DocumentType {
  INE = 'INE',
  ACTA_CONSTITUTIVA = 'ACTA_CONSTITUTIVA',
  COMPROBANTE_DOMICILIO = 'COMPROBANTE_DOMICILIO',
  CONSTANCIA_FISCAL = 'CONSTANCIA_FISCAL',
  PODER_NOTARIAL = 'PODER_NOTARIAL',
  IDENTIFICACION_REPRESENTANTE = 'IDENTIFICACION_REPRESENTANTE',
  IDENTIFICACION_REPRESENTANTE_LEGAL = 'IDENTIFICACION_REPRESENTANTE_LEGAL',
  REGISTRO_PUBLICO_COMERCIO = 'REGISTRO_PUBLICO_COMERCIO',
  ESTADOS_FINANCIEROS = 'ESTADOS_FINANCIEROS',
  OTROS = 'OTROS',
}

export type OnboardingStatus = 'pending' | 'approved' | 'rejected';

export interface OnboardingAddress {
  street: string;
  num_ext?: string;
  num_int?: string;
  reference?: string;
  neighborhood: string;
  estate: string;
  cp: string;
  city?: string;
}

export interface DocumentInfo {
  fileUrl: string;
  type: DocumentType;
  description?: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  sharepointFolderPath?: string;
  sharepointFileId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'modify';
  statusReason?: string;
  uuid: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

/** Application-level onboarding record (maps to `OnboardingRecord` entity). */
export interface Onboarding {
  id?: string;
  uuid: string;
  rfc?: string;
  status: OnboardingStatus;
  company_name?: string;
  phone?: string;
  email?: string;
  address?: OnboardingAddress;
  documents?: DocumentInfo[];
  economic_activity?: string;
  economic_activity_code?: string;
  form_data?: Record<string, unknown>;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

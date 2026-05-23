export interface ProspectAddress {
  street?: string;
  num_ext?: string;
  num_int?: string;
  neighborhood?: string;
  district?: string;
  estate?: string;
  cp?: string;
  reference?: string;
}

export interface ProspectDocument {
  uuid: string;
  type: string;
  description: string;
  originalName: string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
  status: string;
  statusReason?: string;
  uploadedAt?: string;
}

export interface KycFeatureData {
  status?: string;
  score?: number;
  warnings?: Array<{ short_description?: string }>;
}

export interface KycStatus {
  status?: string;
  providerPayload?: {
    status?: string;
    features?: string[];
    id_verification?: KycFeatureData;
    liveness?: KycFeatureData;
    face_match?: KycFeatureData;
    questionnaire?: KycFeatureData;
    aml?: KycFeatureData;
    ip_analysis?: KycFeatureData;
  };
}

export interface Prospect {
  uuid: string;
  id?: string;
  company_name: string;
  email: string;
  rfc: string;
  phone?: string;
  status: string;
  rejection_reason?: string;
  requested_kyc: boolean;
  kycStatus?: KycStatus;
  documents: ProspectDocument[];
  economic_activity?: { name?: string };
  address?: ProspectAddress;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProspectsResponse {
  total: number;
  data: Prospect[];
}

export type DocumentStatusAction = "approved" | "rejected" | "modify";

export const PROSPECT_STATUS_LABELS: Record<string, string> = {
  approved: "Aprobado",
  rejected: "Rechazado",
  pending: "Pendiente",
};

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  modify: "Modificación solicitada",
};

export const KYC_STATUS_LABELS: Record<string, string> = {
  "In Review": "En revisión",
  Pending: "Pendiente",
  Approved: "Aprobado",
  Rejected: "Rechazado",
  Abandoned: "Abandonado",
};

export const KYC_STEP_LABELS: Record<
  string,
  { key: string; hasScore: boolean; name: string }
> = {
  ID_VERIFICATION: {
    key: "id_verification",
    hasScore: false,
    name: "Verificación de ID",
  },
  LIVENESS: { key: "liveness", hasScore: true, name: "Verificación de vida" },
  FACE_MATCH: { key: "face_match", hasScore: true, name: "Coincidencia facial" },
  QUESTIONNAIRE: { key: "questionnaire", hasScore: false, name: "Cuestionario" },
  AML: { key: "aml", hasScore: false, name: "Análisis de lavado de dinero" },
  IP_ANALYSIS: {
    key: "ip_analysis",
    hasScore: true,
    name: "Análisis de dirección IP",
  },
};

export function canApproveProspect(prospect: Prospect): boolean {
  if (prospect.requested_kyc && prospect.kycStatus?.status !== "Approved") {
    return false;
  }
  if (!prospect.documents?.length) return false;
  return prospect.documents.every(
    (doc) => doc.status === "approved" || doc.status === "rejected",
  );
}

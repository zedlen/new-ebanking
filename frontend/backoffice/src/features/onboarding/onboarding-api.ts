import { apiGet, apiPost } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  DocumentStatusAction,
  Prospect,
  ProspectsResponse,
} from "@/types/onboarding";

const empty: ProspectsResponse = { total: 0, data: [] };

export async function fetchOnboardings(
  offset: number,
  limit: number,
): Promise<ProspectsResponse> {
  try {
    return await apiGet<ProspectsResponse>(
      `${endpoints.onboardings}?offset=${offset}&limit=${limit}`,
    );
  } catch {
    return empty;
  }
}

export async function fetchProspect(id: string): Promise<Prospect | null> {
  try {
    return await apiGet<Prospect>(`${endpoints.onboardings}/${id}`);
  } catch {
    return null;
  }
}

export async function approveProspect(id: string): Promise<boolean> {
  try {
    await apiPost(`${endpoints.onboardings}/${id}/approve`, {});
    return true;
  } catch {
    return false;
  }
}

export async function rejectProspect(
  id: string,
  rejectionReason: string,
): Promise<boolean> {
  try {
    await apiPost(`${endpoints.onboardings}/${id}/reject`, {
      rejection_reason: rejectionReason,
    });
    return true;
  } catch {
    return false;
  }
}

export async function requestProspectKyc(id: string): Promise<boolean> {
  try {
    await apiPost(`${endpoints.onboardings}/${id}/request-kyc`, {});
    return true;
  } catch {
    return false;
  }
}

export async function changeDocumentStatus(
  prospectId: string,
  documentId: string,
  status: DocumentStatusAction,
  statusReason?: string,
): Promise<boolean> {
  try {
    await apiPost(
      `${endpoints.onboardings}/${prospectId}/documents/${documentId}/status`,
      { status, status_reason: statusReason },
    );
    return true;
  } catch {
    return false;
  }
}

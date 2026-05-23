import { isAxiosError } from "axios";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toApiVariables } from "@/features/mailing/mailing-utils";
import type {
  MailingTemplateDetail,
  MailingTemplatesResponse,
  SendMailFormValues,
  TemplateFormValues,
} from "@/types/mailing";
import { emptyTemplateDetail } from "@/types/mailing";

const emptyList: MailingTemplatesResponse = { data: [], has_more: false };

function unwrapDetail(data: unknown): MailingTemplateDetail {
  if (!data || typeof data !== "object") return emptyTemplateDetail;
  const wrapped = data as { data?: MailingTemplateDetail };
  if (wrapped.data) return wrapped.data;
  return data as MailingTemplateDetail;
}

function unwrapList(data: unknown): MailingTemplatesResponse {
  if (!data || typeof data !== "object") return emptyList;
  const wrapped = data as MailingTemplatesResponse;
  if (Array.isArray(wrapped.data)) {
    return {
      data: wrapped.data,
      has_more: wrapped.has_more ?? false,
    };
  }
  if (Array.isArray(data)) {
    return { data: data as MailingTemplatesResponse["data"], has_more: false };
  }
  return emptyList;
}

export async function fetchMailingTemplates(): Promise<MailingTemplatesResponse> {
  try {
    const data = await apiGet<unknown>(endpoints.mailing.templates);
    return unwrapList(data);
  } catch {
    return emptyList;
  }
}

export async function fetchMailingTemplate(
  id: string,
): Promise<MailingTemplateDetail> {
  try {
    const data = await apiGet<unknown>(`${endpoints.mailing.templates}/${id}`);
    return unwrapDetail(data);
  } catch {
    return emptyTemplateDetail;
  }
}

export async function createMailingTemplate(
  values: TemplateFormValues,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const payload = {
      name: values.name,
      from: values.from,
      subject: values.subject,
      reply_to: values.reply_to,
      html: values.html,
      text: values.text,
      design: values.design,
      variables: toApiVariables(values.variables),
    };
    const data = await apiPost<{ data?: MailingTemplateDetail }>(
      endpoints.mailing.templates,
      payload,
    );
    return { success: true, id: unwrapDetail(data).id || data?.data?.id };
  } catch (error) {
    return {
      success: false,
      error: isAxiosError(error)
        ? String(error.response?.data?.message ?? error.message)
        : undefined,
    };
  }
}

export async function updateMailingTemplate(
  id: string,
  values: TemplateFormValues,
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      name: values.name,
      from: values.from,
      subject: values.subject,
      reply_to: values.reply_to,
      html: values.html,
      text: values.text,
      design: values.design,
      variables: toApiVariables(values.variables),
    };
    await apiPatch(`${endpoints.mailing.templates}/${id}`, payload);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: isAxiosError(error)
        ? String(error.response?.data?.message ?? error.message)
        : undefined,
    };
  }
}

export async function sendMailingTemplate(
  templateId: string,
  values: SendMailFormValues,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiPost(endpoints.mailing.send, {
      ...values,
      to: values.to,
      template_id: templateId,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: isAxiosError(error)
        ? String(error.response?.data?.message ?? error.message)
        : undefined,
    };
  }
}

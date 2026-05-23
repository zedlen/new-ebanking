export interface MailingTemplateListItem {
  id: string;
  name: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  alias: string;
}

export interface MailingTemplateVariable {
  id?: string;
  key: string;
  type: string;
  fallback_value?: string;
  fallbackValue?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MailingTemplateDetail {
  id: string;
  alias: string;
  name: string;
  created_at: string;
  updated_at: string;
  status: string;
  published_at: string;
  from: string;
  subject: string;
  reply_to: string;
  html: string;
  text: string;
  variables: MailingTemplateVariable[];
  has_unpublished_versions: boolean;
  design?: Record<string, unknown>;
}

export interface MailingTemplatesResponse {
  data: MailingTemplateListItem[];
  has_more: boolean;
}

export interface TemplateFormVariable {
  id?: string;
  key: string;
  type: string;
  fallback_value?: string;
  detected?: boolean;
}

export interface TemplateFormValues {
  name: string;
  from: string;
  subject: string;
  reply_to: string;
  html: string;
  text: string;
  variables: TemplateFormVariable[];
  design?: Record<string, unknown>;
}

export interface SendMailFormValues {
  to: string;
  from: string;
  subject: string;
  reply_to: string;
  variables: Array<{ key: string; value: string }>;
}

export const emptyTemplateDetail: MailingTemplateDetail = {
  id: "",
  alias: "",
  name: "",
  created_at: "",
  updated_at: "",
  status: "",
  published_at: "",
  from: "",
  subject: "",
  reply_to: "",
  html: "",
  text: "",
  variables: [],
  has_unpublished_versions: false,
};

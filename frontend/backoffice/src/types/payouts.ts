export interface PayoutRequestHeaders {
  Uuid: string;
  "Client-Id"?: string;
  "Legacy-Id"?: string;
}

export interface PayoutRequestBody {
  authorization_code?: string;
  card_id?: string;
  card_number?: string;
  card_status?: string;
  product_id?: string;
  external_account_id?: string;
  processing?: { type?: string };
  values?: {
    billing_value?: string;
    billing_currency_code?: string;
    billing_conversion_rate?: string;
  };
  establishment?: string;
}

export interface PayoutAuthorizationRecord {
  ts: string;
  "ts-cst": string;
  request_headers: PayoutRequestHeaders;
  request: {
    body: PayoutRequestBody;
    url?: string;
  };
  customer?: string;
  response: {
    status_code?: string;
    body: {
      response?: string;
      reason?: string;
    };
  };
}

export interface PayoutDayGroup {
  total: string;
  records: PayoutAuthorizationRecord[];
}

export interface ProcessPayoutsResponse {
  dayGrouping: Record<string, PayoutDayGroup>;
  ignoredRecords: PayoutAuthorizationRecord[];
  total: string;
}

export interface PayoutHistoryEntry {
  total: number;
  customer?: string;
}

export interface PayoutHistoryDay {
  date: string;
  results: PayoutHistoryEntry[];
}

export interface PayoutMonthlyRow {
  month: string;
  total: number;
  customer?: string;
  customer_name?: string;
}

export interface CollateralReportRow {
  month?: string;
  customer?: string;
  customer_name: string;
  count?: number;
  total: number;
}

import { Entity } from '@middleware/domain/repositories/entity.interface';

export interface CardCharge extends Entity {
  id: string;
  ts: string;
  'ts-cst': string;
  request_headers: RequestHeaders;
  request: RequestData;
  customer: string;
  response: ResponseData;
}

export interface RequestHeaders {
  Uuid: string;
  'Client-Id': string;
  'Legacy-Id': string;
}

export interface RequestData {
  body: RequestBody;
  url: string;
}

export interface RequestBody {
  authorization_code: string;
  card_id: string;
  card_number: string;
  card_status: string;
  product_id: string;
  external_account_id: string;
  processing: Processing;
  values: BillingValues;
  establishment: string;
}

export interface Processing {
  type: 'PURCHASE' | 'WITHDRAWAL' | string;
}

export interface BillingValues {
  billing_value: string;
  billing_currency_code: string;
  billing_conversion_rate: string;
}

export interface ResponseData {
  status_code: string;
  body: ResponseBody;
}

export interface ResponseBody {
  response: string;
  reason: string;
}

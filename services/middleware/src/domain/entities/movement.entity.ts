import { Entity } from '@middleware/domain/repositories/entity.interface';

export interface Movement extends Entity {
  id?: string;
  external_id: string;
  account_id: string;
  type: number;
  description: string;
  amount: number;
  folio: string;
  status: string;
  operation_date: string;
  application_date: string;
  origin_bank_id: string;
  payer_name: string;
  payer_account: string;
  destination_bank_id: string;
  beneficiary_name: string;
  beneficiary_account: string;
  payment_purpose: string;
  reference: number;
  tracking_key: string;
  app: string;
}

export type MovementDetail = {
  id: number;
  movement_id: string;
  ts: string;
  status: string;
  message?: string;
};

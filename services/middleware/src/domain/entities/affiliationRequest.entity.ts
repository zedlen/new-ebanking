import { Entity } from '@middleware/domain/repositories/entity.interface';
import { Address } from '@middleware/domain/schemas/address.entity';

export type AffiliationStatus = 'pending' | 'approved' | 'rejected';
export interface AffiliationRequest extends Entity {
  id?: string;
  parent_id: string;
  rfc: string;
  company_name: string;
  name: string;
  ap_paterno: string;
  ap_materno: string;
  taxpayer_type_id: number;
  address: Omit<Address, 'id' | 'external_id'>;
  contact_name: string;
  contact_email: string;
  contact_tel: string;
  customer_type?: number;
  status: AffiliationStatus;
  app: string;
  active: boolean;
}

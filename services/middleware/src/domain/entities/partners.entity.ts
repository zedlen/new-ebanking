import { Entity } from '@middleware/domain/repositories/entity.interface';
import { Address } from './address.entity';

export interface Partner extends Entity {
  id?: string;
  external_id: string;
  rfc: string;
  company_name: string;
  economic_activity: string;
  business_activity: string;
  taxpayer_type_id: number;
  company_address_id: number;
  company_address: Address;
  address: Address;
  contact_name: string;
  contact_email: string;
  contact_tel: string;
  company_tel: string;
  status: string;
  creation_date: string;
  modification_date: string;
  image: string;
  customer_type?: number;
  email?: string;
  blocked?: boolean;
  username?: string;
  role_id?: number;
  otp?: string;
  affiliation_code?: string;
  review_date: string;
  process_date: string;
  app: string;
}

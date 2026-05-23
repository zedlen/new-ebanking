import { Entity } from '@middleware/domain/repositories/entity.interface';
import { Address } from '@middleware/domain/schemas/address.entity';

export interface Customer extends Entity {
  id?: string;
  external_id: string;
  parent_id: string;
  account_customer_id: string;
  level: number;
  rfc: string;
  company_name: string;
  name: string;
  ap_paterno: string;
  ap_materno: string;
  taxpayer_type_id: number;
  address_id: number;
  address: Address;
  contact_name: string;
  contact_email: string;
  contact_tel: string;
  creation_date: string;
  image: string;
  customer_type?: number;
  email?: string;
  blocked?: boolean;
  username?: string;
  role_id?: number;
  otp?: string;
  affiliation_code?: string;
  app: string;
}

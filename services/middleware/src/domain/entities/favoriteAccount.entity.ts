import { Entity } from '@middleware/domain/repositories/entity.interface';

export interface FavoriteAccount extends Entity {
  id?: string;
  customer_id: string;
  account_id: string;
  account_type: number;
  account_alias: string;
  beneficiary_name: string;
  beneficiary_email: string;
}

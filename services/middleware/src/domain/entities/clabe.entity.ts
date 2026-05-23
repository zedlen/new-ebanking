import { Entity } from '@middleware/domain/repositories/entity.interface';

export interface Clabe extends Entity {
  id: string;
  payment_provider_id: string;
  account_id: string;
  clabe: string;
  cc: string;
}

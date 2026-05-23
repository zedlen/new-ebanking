import { Entity } from '@middleware/domain/repositories/entity.interface';

export interface Vault extends Entity {
  id: string;
  external_id: string;
  amount: number;
  currency: string;
  app: string;
}

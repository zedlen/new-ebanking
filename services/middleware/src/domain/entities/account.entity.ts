import { Entity } from '@middleware/domain/repositories/entity.interface';
import { Clabe } from './clabe.entity';

export interface Account extends Entity {
  id?: string;
  external_id: string;
  type: number;
  amount: number;
  currency: string;
  linked_cellphone?: string;
  customer_id: string;
  alias?: string;
  creation_date: string;
  clabe?: Clabe;
  clabes?: Clabe[];
  product?: {
    id: string;
    name: string;
    type_id: string;
  };
  operation_limits?: {
    id: string;
    daily_limit: number;
    monthly_limit: number;
    purchase_limit: number;
    transaction_limit: number;
  };
  status?: string;
  app: string;
}

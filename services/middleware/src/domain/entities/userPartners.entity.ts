import { Entity } from '@middleware/domain/repositories/entity.interface';
export interface UserPartners extends Entity {
  id: string;
  customerId: string;
  asignedPartners: string[];
  allPartners: boolean;
}

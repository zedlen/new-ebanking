import { Entity } from '@middleware/domain/repositories/entity.interface';

export interface Address extends Entity {
  id?: string;
  street: string;
  num_ext: string;
  num_int?: string;
  reference?: string;
  neighborhood: string;
  district: string;
  estate: string;
  cp: string;
}

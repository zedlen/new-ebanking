import { Entity } from '@middleware/domain/repositories/entity.interface';

export interface UserAgent extends Entity {
  id?: string;
  ua: string;
  info: any;
}

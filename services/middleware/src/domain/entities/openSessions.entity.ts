import { Entity } from '@middleware/domain/repositories/entity.interface';

export interface OpenSession extends Entity {
  id?: string;
  tki: string;
  u: string;
  agent: string;
  ip: string;
  active?: boolean;
}

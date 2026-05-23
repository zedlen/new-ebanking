import { Entity } from '@middleware/domain/repositories/entity.interface';
export interface User extends Entity {
  id?: string;
  username: string;
  image: string;
  name: string;
}

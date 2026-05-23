import { Entity } from '@middleware/domain/repositories/entity.interface';

export interface AppConfigField extends Entity {
  id?: string;
  name: string;
  description: string;
  type: string;
  active: boolean;
  version?: number;
  slug?: string;
  required?: boolean;
}

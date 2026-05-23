import { Entity } from '@middleware/domain/repositories/entity.interface';

export interface AppConfig extends Entity {
  id?: string;
  appName: string;
  config: object;
  active: boolean;
  version: number;
}

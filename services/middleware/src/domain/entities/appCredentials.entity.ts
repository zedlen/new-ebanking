import { Entity } from '@middleware/domain/repositories/entity.interface';

export interface AppCredential extends Entity {
  appName: string;
  enviroment: string;
  apiKey: string;
  status: string;
  url: string;
}

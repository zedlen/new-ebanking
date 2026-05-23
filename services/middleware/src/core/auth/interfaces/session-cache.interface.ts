import { AppModule } from '../constants/app-modules';

export interface SessionCachePayload {
  /** Encrypted Kubit user token */
  t: string;
  /** User id */
  i: string;
  /** Module this session is bound to */
  m: AppModule;
}

export interface SessionJwtPayload {
  apn: string;
  evn: string;
  tk: string;
  uid: string;
}

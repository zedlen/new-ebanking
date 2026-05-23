import { Request } from 'express';
export abstract class AuthenticationService {
  abstract isAuthenticated(
    req: Request,
  ): Promise<{ isAuthenticated: boolean; userId: string }>;
}

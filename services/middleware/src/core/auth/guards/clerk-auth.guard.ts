import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { getAuth } from '@clerk/express';
import { Request } from 'express';

/**
 * Clerk authentication for manager module (Phase 3 routes).
 * Registered in AuthModule for reuse by files/manager controllers.
 */
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { isAuthenticated, userId } = getAuth(request);
    if (!isAuthenticated || !userId) {
      throw new UnauthorizedException('Clerk authentication required');
    }
    request.headers['user-id'] = userId;
    return Promise.resolve(true);
  }
}

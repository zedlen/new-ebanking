import { CanActivate, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** SEC-03: blocks destructive dev-only routes when NODE_ENV is production. */
@Injectable()
export class NonProductionGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(): boolean {
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';
    if (nodeEnv === 'production') {
      throw new NotFoundException();
    }
    return true;
  }
}

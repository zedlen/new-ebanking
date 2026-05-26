import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import type { Cache } from 'cache-manager';
import { AppCredentialsRepository } from '@middleware/domain/repositories/appCredentials.interface';
import {
  SessionCachePayload,
  SessionJwtPayload,
} from '../interfaces/session-cache.interface';
import { CryptoService } from '../services/crypto.service';
import { isAppModule, resolveModuleFromUrl } from '../constants/app-modules';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly appCredentialRepository: AppCredentialsRepository,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const cookies: Record<string, string> = request.cookies as Record<
      string,
      string
    >;

    const cookieIndex =
      this.configService.get<string>('COOKIES_TOKEN_INDEX') ?? 'session';
    const sessionLifeTime = parseInt(
      this.configService.get<string>('SESSION_LIFE_TIME') ??
        String(60 * 60 * 1000),
      10,
    );

    const moduleFromRequest = resolveModuleFromUrl(request.url);
    const isGlobalAuthRoute = request.url.startsWith('/api/v1/auth');

    const ckToken = cookies?.[cookieIndex];
    if (!ckToken) {
      throw new UnauthorizedException('Token is not present');
    }

    try {
      const token = this.cryptoService.decrypt(ckToken);
      const payload = await this.jwtService.verifyAsync<SessionJwtPayload>(
        token,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );

      const cached = (await this.cacheManager.get(payload.tk)) as string;
      if (!cached) {
        throw new UnauthorizedException('Session expired');
      }

      let userTokenData: SessionCachePayload;
      try {
        userTokenData = JSON.parse(cached) as SessionCachePayload;
      } catch {
        throw new UnauthorizedException('Invalid session payload');
      }

      if (!isAppModule(userTokenData.m)) {
        throw new UnauthorizedException('Invalid session module');
      }
      if (!isGlobalAuthRoute) {
        if (!moduleFromRequest) {
          throw new UnauthorizedException(
            'Could not resolve application module from URL',
          );
        }
        if (userTokenData.m !== moduleFromRequest) {
          throw new UnauthorizedException('Invalid access for module');
        }
      }

      const userTokenForRequest = this.cryptoService.decrypt(userTokenData.t);

      const appCredential = await this.appCredentialRepository.findOne({
        appName: payload.apn,
        enviroment: payload.evn,
      });
      if (!appCredential) {
        throw new UnauthorizedException('Application credentials not found');
      }

      response.cookie(cookieIndex, this.cryptoService.encrypt(token), {
        maxAge: sessionLifeTime,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      await this.cacheManager.set(payload.tk, cached, sessionLifeTime);

      request.headers['APP_NAME'] = payload.apn;
      request.headers['APP_ENV'] = payload.evn;
      request.headers['USER_TOKEN'] = userTokenForRequest;
      request.headers['USER_ID'] = userTokenData.i;
      request.headers['API_KEY'] = appCredential.apiKey;
      request.headers['API_URL'] = appCredential.url;
      request.headers['TID'] = payload.tk;
      request.headers['APP_MODULE'] = userTokenData.m;

      return true;
    } catch (error) {
      this.logger.error({ error });
      response.clearCookie(cookieIndex);
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Authentication failed');
    }
  }
}

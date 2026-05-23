// @ts-nocheck — Phase 3 port from old-middleware (core/auth/guards/origin.guard.ts); tighten types later.
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OriginGuard implements CanActivate {
  private logger = new Logger(OriginGuard.name);

  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Permitir peticiones OPTIONS (preflight de CORS) sin validación
    if (request.method === 'OPTIONS') {
      return true;
    }

    // Obtener headers de origen
    const origin = request.headers.origin;
    const referer = request.headers.referer;
    const userAgent = request.headers['user-agent'];

    // Obtener orígenes permitidos de configuración
    const allowedOrigins = JSON.parse(this.configService.get('ALLOWED_ORIGINS') || '[]');

    // Validación 1: Origin header
    if (!origin) {
      this.logger.warn('Request sin header Origin detectada', {
        ip: request.ip,
        userAgent,
        url: request.url,
      });
      throw new ForbiddenException('Origin header requerido');
    }

    // Validación 2: Origin debe estar en la lista permitida
    const isAllowedOrigin = allowedOrigins.some((allowedOrigin) => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (Array.isArray(allowedOrigin)) {
        // Soporte para RegExp configurados como arrays
        const regex = new RegExp(allowedOrigin[0], allowedOrigin[1]);
        return regex.test(origin);
      }
      return false;
    });

    if (!isAllowedOrigin) {
      this.logger.warn('Origin no permitido detectado', {
        origin,
        ip: request.ip,
        userAgent,
        url: request.url,
      });
      throw new ForbiddenException('Origin no autorizado');
    }

    // Validación 3: Referer debe coincidir con origin (si existe)
    if (referer && !referer.startsWith(origin)) {
      this.logger.warn('Referer inconsistente detectado', {
        origin,
        referer,
        ip: request.ip,
        userAgent,
      });
      throw new ForbiddenException('Referer inconsistente');
    }

    // Validación 4: Detectar user agents sospechosos
    if (!userAgent || this.isSuspiciousUserAgent(userAgent)) {
      this.logger.warn('User Agent sospechoso detectado', {
        userAgent,
        origin,
        ip: request.ip,
      });
      throw new ForbiddenException('User Agent no válido');
    }

    // Log de acceso exitoso
    this.logger.log('Validación de origen exitosa', {
      origin,
      ip: request.ip,
      url: request.url,
    });

    return true;
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /apache/i,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
  }
}

// @ts-nocheck — Phase 3 port from old-middleware (core/auth/guards/temporary-token.guard.ts); tighten types later.
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class TemporaryTokenGuard implements CanActivate {
  private logger = new Logger(TemporaryTokenGuard.name);

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Obtener token del header
    const providedToken = request.headers['x-onboarding-token'] || request.headers['X-ONBOARDING-TOKEN'];

    if (!providedToken) {
      this.logger.warn('Token temporal no proporcionado');
      throw new UnauthorizedException('Token de onboarding requerido');
    }

    // Validar token en cache
    const tokenData = await this.cacheManager.get(`onboarding_token:${providedToken}`);

    if (!tokenData) {
      this.logger.warn(`Token temporal inválido o expirado: ${providedToken.substring(0, 8)}...`);
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const parsedTokenData = JSON.parse(tokenData as string);

    // Validar fingerprint del cliente (opcional)
    const clientFingerprint = this.generateClientFingerprint(request);
    if (parsedTokenData.fingerprint !== clientFingerprint) {
      this.logger.warn('Fingerprint del cliente no coincide', {
        token: providedToken.substring(0, 8),
        expectedFingerprint: parsedTokenData.fingerprint,
        actualFingerprint: clientFingerprint,
      });
      throw new UnauthorizedException('Token no válido para este cliente');
    }

    // Validar límite de uso
    if (parsedTokenData.usageCount >= parsedTokenData.maxUsage) {
      this.logger.warn('Token temporal excedió límite de uso', {
        token: providedToken.substring(0, 8),
        usageCount: parsedTokenData.usageCount,
        maxUsage: parsedTokenData.maxUsage,
      });
      throw new UnauthorizedException('Token ha excedido el límite de uso');
    }

    // Incrementar contador de uso
    parsedTokenData.usageCount += 1;
    parsedTokenData.lastUsed = new Date().toISOString();

    // Actualizar en cache
    await this.cacheManager.set(
      `onboarding_token:${providedToken}`,
      JSON.stringify(parsedTokenData),
      300000, // 5 minutos TTL
    );

    // Agregar información del token al request
    request.headers['VALIDATED_TOKEN'] = true;
    request.headers['TOKEN_USAGE_COUNT'] = parsedTokenData.usageCount.toString();
    request.headers['REQUEST_SOURCE'] = 'onboarding-frontend';

    this.logger.log('Token temporal validado exitosamente', {
      token: providedToken.substring(0, 8),
      usageCount: parsedTokenData.usageCount,
      maxUsage: parsedTokenData.maxUsage,
    });

    return true;
  }

  /**
   * Genera un token temporal para un cliente específico
   */
  async generateTemporaryToken(request: any): Promise<{ token: string; expiresAt: Date }> {
    const token = randomBytes(32).toString('hex');
    const clientFingerprint = this.generateClientFingerprint(request);
    const expiresAt = new Date(Date.now() + 600000); // 10 minutos

    const tokenData = {
      fingerprint: clientFingerprint,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      usageCount: 0,
      maxUsage: 3, // Máximo 3 usos por token
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    };

    // Guardar en cache con TTL de 10 minutos
    await this.cacheManager.set(`onboarding_token:${token}`, JSON.stringify(tokenData), 600000);

    this.logger.log('Token temporal generado', {
      token: token.substring(0, 8),
      fingerprint: clientFingerprint,
      expiresAt: expiresAt.toISOString(),
    });

    return { token, expiresAt };
  }

  /**
   * Genera un fingerprint único basado en características del cliente
   */
  private generateClientFingerprint(request: any): string {
    const components = [
      request.ip,
      request.headers['user-agent'] || '',
      request.headers['accept-language'] || '',
      request.headers['accept-encoding'] || '',
    ];

    return createHash('sha256').update(components.join('|')).digest('hex').substring(0, 16);
  }

  /**
   * Revoca un token específico
   */
  async revokeToken(token: string): Promise<void> {
    await this.cacheManager.del(`onboarding_token:${token}`);
    this.logger.log('Token revocado', { token: token.substring(0, 8) });
  }

  /**
   * Limpia tokens expirados (llamar periódicamente)
   */
  async cleanupExpiredTokens(): Promise<void> {
    // Implementar limpieza si el cache no maneja TTL automáticamente
    this.logger.log('Cleanup de tokens expirados ejecutado');
  }
}
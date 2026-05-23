import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

interface SuspiciousActivity {
  ip: string;
  userAgent: string;
  action: string;
  timestamp: Date;
  details: any;
}

@Injectable()
export class SecurityMonitoringService {
  private logger = new Logger(SecurityMonitoringService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Registra una actividad sospechosa y determina si debe ser bloqueada
   */
  async logSuspiciousActivity(
    ip: string,
    userAgent: string,
    action: string,
    details: any = {},
  ): Promise<{ shouldBlock: boolean; reason?: string }> {
    const activity: SuspiciousActivity = {
      ip,
      userAgent,
      action,
      timestamp: new Date(),
      details,
    };

    // Incrementar contador por IP
    const ipKey = `suspicious_activity:${ip}`;
    const currentCount = (await this.cacheManager.get<number>(ipKey)) || 0;
    const newCount = currentCount + 1;

    // Guardar actividad individual
    const activityKey = `activity:${ip}:${Date.now()}`;
    await this.cacheManager.set(activityKey, JSON.stringify(activity), 3600000); // 1 hora

    // Actualizar contador
    await this.cacheManager.set(ipKey, newCount, 3600000); // 1 hora

    this.logger.warn('Actividad sospechosa detectada', {
      ip,
      action,
      count: newCount,
      userAgent: userAgent?.substring(0, 100),
      details,
    });

    // Determinar si debe ser bloqueado
    const shouldBlock = this.shouldBlockIP(newCount, action);

    if (shouldBlock) {
      await this.blockIP(ip, `Demasiadas actividades sospechosas: ${newCount}`);
      this.logger.error('IP bloqueada por actividad sospechosa', {
        ip,
        count: newCount,
        action,
      });
    }

    return {
      shouldBlock,
      reason: shouldBlock
        ? `Demasiadas actividades sospechosas (${newCount})`
        : undefined,
    };
  }

  /**
   * Verifica si una IP está bloqueada
   */
  async isIPBlocked(
    ip: string,
  ): Promise<{ blocked: boolean; reason?: string }> {
    const blockKey = `blocked_ip:${ip}`;
    const blockInfo = await this.cacheManager.get(blockKey);

    if (blockInfo) {
      const parsedInfo = JSON.parse(blockInfo as string);
      return {
        blocked: true,
        reason: parsedInfo.reason,
      };
    }

    return { blocked: false };
  }

  /**
   * Bloquea una IP por un período determinado
   */
  async blockIP(
    ip: string,
    reason: string,
    durationMs: number = 3600000,
  ): Promise<void> {
    const blockKey = `blocked_ip:${ip}`;
    const blockInfo = {
      reason,
      blockedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationMs).toISOString(),
    };

    await this.cacheManager.set(
      blockKey,
      JSON.stringify(blockInfo),
      durationMs,
    );

    this.logger.error('IP bloqueada', {
      ip,
      reason,
      duration: `${durationMs / 1000}s`,
    });
  }

  /**
   * Desbloquea una IP
   */
  async unblockIP(ip: string): Promise<void> {
    const blockKey = `blocked_ip:${ip}`;
    await this.cacheManager.del(blockKey);

    this.logger.log('IP desbloqueada', { ip });
  }

  /**
   * Obtiene estadísticas de actividades sospechosas
   */
  async getSecurityStats(): Promise<any> {
    // Esta implementación es básica, en producción usarías una base de datos
    // para obtener estadísticas más detalladas
    return {
      message: 'Estadísticas de seguridad disponibles en logs',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Determina si una IP debe ser bloqueada basado en el conteo y tipo de actividad
   */
  private shouldBlockIP(count: number, action: string): boolean {
    // Umbrales por tipo de actividad
    const thresholds = {
      invalid_origin: 3,
      invalid_token: 5,
      rate_limit_exceeded: 10,
      file_validation_failed: 8,
      suspicious_user_agent: 2,
      default: 15,
    };

    const threshold = thresholds[action] || thresholds.default;
    return count >= threshold;
  }

  /**
   * Verifica patrones de ataque conocidos
   */
  async checkForAttackPatterns(
    ip: string,
    userAgent: string,
    path: string,
  ): Promise<boolean> {
    // Patrones de user agents sospechosos
    const suspiciousPatterns = [
      /sqlmap/i,
      /nmap/i,
      /nikto/i,
      /havij/i,
      /libwww-perl/i,
      /python-urllib/i,
      /curl\/[0-9]/i,
      /wget/i,
    ];

    const isSuspiciousUA = suspiciousPatterns.some((pattern) =>
      pattern.test(userAgent),
    );

    if (isSuspiciousUA) {
      await this.logSuspiciousActivity(ip, userAgent, 'suspicious_user_agent', {
        path,
        pattern: 'suspicious_user_agent_detected',
      });
      return true;
    }

    return false;
  }

  /**
   * Middleware guard para verificar seguridad
   */
  async validateRequest(
    ip: string,
    userAgent: string,
    path: string,
  ): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // Verificar si la IP está bloqueada
    const ipCheck = await this.isIPBlocked(ip);
    if (ipCheck.blocked) {
      return {
        allowed: false,
        reason: `IP bloqueada: ${ipCheck.reason}`,
      };
    }

    // Verificar patrones de ataque
    const hasAttackPattern = await this.checkForAttackPatterns(
      ip,
      userAgent,
      path,
    );
    if (hasAttackPattern) {
      return {
        allowed: false,
        reason: 'Patrón de ataque detectado',
      };
    }

    return { allowed: true };
  }
}

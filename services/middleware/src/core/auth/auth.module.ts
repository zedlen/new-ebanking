import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import KeyvRedis from '@keyv/redis';
import { ApplicationModule } from '@middleware/application/application.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { CryptoService } from './services/crypto.service';

@Module({
  imports: [
    ApplicationModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUri = config.get<string>('REDIS_URI');
        if (redisUri) return { stores: [new KeyvRedis(redisUri)] };
        return {};
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const sessionMs = parseInt(
          config.get<string>('SESSION_LIFE_TIME') ?? String(3600 * 1000),
          10,
        );
        const jwtExpiresIn =
          config.get<string>('JWT_EXPIRES_IN') ??
          `${Math.floor(sessionMs / 1000)}s`;
        return {
          secret: config.get<string>('JWT_SECRET') ?? 'change-me',
          signOptions: {
            expiresIn: jwtExpiresIn as
              | `${number}s`
              | `${number}h`
              | `${number}d`,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, ClerkAuthGuard, CryptoService],
  exports: [AuthService, AuthGuard, ClerkAuthGuard, CryptoService, JwtModule],
})
export class AuthModule {}

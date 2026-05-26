import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, RouterModule } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { AppConfigModule } from './core/config/config.module';
import { BullModule } from '@nestjs/bullmq';
import { LoggingModule } from '@middleware/core/logging/logging.module';
import { DatabaseModule } from './core/database/database.module';
import {
  GLOBAL_THROTTLE_LIMIT,
  GLOBAL_THROTTLE_TTL_MS,
} from '@middleware/core/throttling/throttling.constants';
import { AuthModule } from './core/auth/auth.module';
import { ApplicationModule } from './application/application.module';
import { BackofficeModule } from './modules/backoffice/backoffice.module';
import { EbankingModule } from './modules/ebanking/ebanking.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';

@Module({
  imports: [
    AppConfigModule,
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: GLOBAL_THROTTLE_TTL_MS,
        limit: GLOBAL_THROTTLE_LIMIT,
      },
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URI') ?? 'redis://127.0.0.1:6379',
        },
      }),
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    LoggingModule,
    DatabaseModule.register(),
    ApplicationModule,
    AuthModule,
    BackofficeModule,
    EbankingModule,
    FeatureFlagsModule,
    RouterModule.register([
      { path: 'ebanking', module: EbankingModule },
      { path: 'backoffice', module: BackofficeModule },
      //{ path: 'mobile', module: MobileModule },
      //{ path: 'onboarding', module: OnboardingModule },
      //{ path: 'manager', module: ManagerModule },
      //{ path: 'treasury', module: TreasuryModule },
      { path: 'feature-flags', module: FeatureFlagsModule },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

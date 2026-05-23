// @ts-nocheck
import { Module } from '@nestjs/common';
import { ApplicationModule } from '@middleware/application/application.module';
import { AuthModule } from '@middleware/core/auth/auth.module';
import { FeatureFlagsReadController } from './controllers/feature-flag.controller';

/** App-facing feature flag reads (`/api/feature-flags/v1/...`). Manager CRUD stays on ManagerModule. */
@Module({
  imports: [ApplicationModule, AuthModule],
  controllers: [FeatureFlagsReadController],
})
export class FeatureFlagsModule {}

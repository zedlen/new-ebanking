import { AuthGuard } from '@middleware/core/auth/guards/auth.guard';
import { FeatureFlagService } from '@middleware/application/services/feature-flag/featureFlag.service';
import { Controller, Get, Headers, Param, UseGuards } from '@nestjs/common';

@Controller({ version: '1', path: 'feature-flags' })
@UseGuards(AuthGuard)
export class FeatureFlagsReadController {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  @Get('validate/:slug')
  validateFeatureFlagForUser(
    @Headers() headers: Record<string, string>,
    @Param('slug') slug: string,
  ) {
    const userId = headers['USER_ID'];
    return this.featureFlagService.reviewFeatureForUser(userId, slug);
  }

  @Get('user-list')
  getUserEnableFeatures(@Headers() headers: Record<string, string>) {
    const userId = headers['USER_ID'];
    return this.featureFlagService.getUserEnableFlags(userId);
  }
}

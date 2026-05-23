// @ts-nocheck
import { FeatureFlagRepository } from '@middleware/domain/repositories/featureFlag.interface';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class FeatureFlagService {
  private readonly logger = new Logger(FeatureFlagService.name);
  private readonly POSITIVE_RESPONSE = { enable: true };
  private readonly NEGATIVE_RESPONSE = { enable: false };
  constructor(private readonly featureFlagRepository: FeatureFlagRepository) {}

  async reviewFeatureForUser(userId: string, featureSlug: string) {
    const feature = await this.featureFlagRepository.findOne({ slug: featureSlug });
    if (!feature) throw new NotFoundException('Not Feature with specified slug');
    if (feature.enableAll && !feature.excludeUsers.includes(userId)) return this.POSITIVE_RESPONSE;
    if (feature.activeUsers.includes(userId)) return this.POSITIVE_RESPONSE;

    return this.NEGATIVE_RESPONSE;
  }

  async getUserEnableFlags(userId: string) {
    const { data: features } = await this.featureFlagRepository.getAll();
    return features
      .filter((feature) => {
        if (feature.enableAll && !feature.excludeUsers.includes(userId)) return true;
        if (feature.activeUsers.includes(userId)) return true;
        return false;
      })
      .map((feature) => feature.slug);
  }
}

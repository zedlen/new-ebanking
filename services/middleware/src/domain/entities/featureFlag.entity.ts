import { Entity } from '@middleware/domain/repositories/entity.interface';

export interface FeatureFlag extends Entity {
  id: string;
  slug: string;
  description: string;
  status: 'alpha' | 'beta' | 'released' | 'obsolet' | 'rollback';
  releaseDate: Date;
  activeUsers: string[];
  excludeUsers: string[];
  enableAll: boolean;
}

// Check if enable all, if so check the user is not excluded
// Validate the user has enabled the featureFlag
// all feature flags will be born as alpha release, when creating a feature flag it cannot be enable to all users
// when adding more users it will transit to beta status
// after enablig for all it will be set to released
// after 3 months in released it will be obsolet
// if it has been released and get disabled for all and enable for a few then will be considered as rollback

// feature flag will be in shared module (service and controller(only validation)) as all applications can check for features
// in manager will be the controller for creation and managing the flags

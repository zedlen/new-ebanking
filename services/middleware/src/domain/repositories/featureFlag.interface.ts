import { FeatureFlag } from '@middleware/domain/entities/featureFlag.entity';
import { Repository } from './repository.interface';

export abstract class FeatureFlagRepository extends Repository<FeatureFlag> {}

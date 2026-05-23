import { KYCReview } from '@middleware/domain/entities/kycReview.entity';
import { Repository } from './repository.interface';

export abstract class KYCReviewRepository extends Repository<KYCReview> {}

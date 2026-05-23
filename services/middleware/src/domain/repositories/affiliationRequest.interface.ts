import { AffiliationRequest } from '@middleware/domain/entities/affiliationRequest.entity';
import { Repository } from './repository.interface';

export abstract class AffiliationRequestRepository extends Repository<AffiliationRequest> {
  abstract softDelete(item: Partial<AffiliationRequest>): Promise<boolean>;
}

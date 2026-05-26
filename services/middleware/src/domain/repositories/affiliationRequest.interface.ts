import { AffiliationRequest } from '@middleware/domain/entities/affiliationRequest.entity';
import { Repository } from './repository.interface';
import {
  PaginatedResult,
  Pagination,
} from '../interfaces/pagination.interface';

export abstract class AffiliationRequestRepository extends Repository<AffiliationRequest> {
  abstract softDelete(id: string): Promise<boolean>;
  abstract findOne(
    query: Partial<AffiliationRequest>,
  ): Promise<AffiliationRequest>;
  abstract find(
    query: Partial<AffiliationRequest>,
    pagination: Pagination,
  ): Promise<PaginatedResult<AffiliationRequest>>;
}

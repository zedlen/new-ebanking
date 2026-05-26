import { Partner } from '@middleware/domain/entities/partners.entity';
import {
  PaginatedResult,
  Pagination,
} from '@middleware/domain/interfaces/pagination.interface';
import { Repository } from './repository.interface';

export abstract class PartnerRepository extends Repository<Partner> {
  abstract findByExternalIds(
    ids: [string],
    pagination?: Pagination,
  ): Promise<PaginatedResult<Partner>>;
  abstract searchByQuery(query: string): Promise<Partner[]>;
  abstract findByAffiliationCode(
    affiliationCode: string,
    app: string,
  ): Promise<Partner | null>;
}

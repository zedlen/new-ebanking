import { Movement } from '@middleware/domain/entities/movement.entity';
import {
  Pagination,
  PaginatedResult,
} from '@middleware/domain/interfaces/pagination.interface';
import { Repository } from './repository.interface';
import { MovementsFilter } from './MovementsFilter.interface';

export abstract class MovementRepository extends Repository<Movement> {
  abstract getLastMovements(accountId: string): Promise<Movement | null>;
  abstract filterMovements(
    accountId: string,
    filter: MovementsFilter,
    pagination: Pagination,
  ): Promise<PaginatedResult<Movement>>;
  abstract getByQuery(
    accountId: string,
    query: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Movement>>;
}

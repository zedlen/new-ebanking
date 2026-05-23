import { CardCharge } from '@middleware/domain/entities/cardCharge.entity';
import {
  Pagination,
  PaginatedResult,
} from '@middleware/domain/interfaces/pagination.interface';
import { Repository } from './repository.interface';

export abstract class CardChargeRepository extends Repository<CardCharge> {
  /* -------------------- BASIC CRUD -------------------- */

  abstract bulkInsert?(items: CardCharge[]): Promise<number>;

  /* -------------------- BUSINESS METHODS -------------------- */

  abstract findByCustomer(
    customer: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<CardCharge>>;

  abstract findByDateRange(
    from: Date,
    to: Date,
    pagination?: Pagination,
    customer?: string,
  ): Promise<PaginatedResult<CardCharge>>;

  abstract findRejected(
    pagination?: Pagination,
    customer?: string,
  ): Promise<PaginatedResult<CardCharge>>;

  abstract sumByDateRange(
    from: Date,
    to: Date,
    customer?: string,
  ): Promise<number>;

  abstract aggregateByDay(
    from: Date,
    to: Date,
    customer?: string,
  ): Promise<
    Array<{
      date: string;
      results: Array<{
        customer: string;
        total: number;
      }>;
    }>
  >;

  abstract aggregateByMonth(
    from: Date,
    to: Date,
  ): Promise<
    Array<{
      month: string;
      total: number;
    }>
  >;

  abstract getClientsResumeByDateRange(
    from: Date,
    to: Date,
  ): Promise<
    Array<{
      customer: string;
      total: number;
      count: number;
    }>
  >;
}

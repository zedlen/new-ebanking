import { Customer } from '@middleware/domain/entities/customers.entity';
import {
  Pagination,
  PaginatedResult,
} from '@middleware/domain/interfaces/pagination.interface';
import { Partner } from '@middleware/domain/entities/partners.entity';
import { Account } from '@middleware/domain/entities/account.entity';
import { Card } from '@middleware/domain/entities/card.entity';
import { Repository } from './repository.interface';

export abstract class CustomerRepository extends Repository<Customer> {
  abstract findByExternalIds(ids: string[]): Promise<Customer[]>;

  abstract searchByQuery(
    query: string,
  ): Promise<Array<Customer & { Partner: Partner }>>;
  abstract searchByQueryWallets(
    query: string,
  ): Promise<Array<Customer & { Partner: Partner; Customer: Customer }>>;
  abstract getCustomerAffiliations(
    filters: { [key: string]: string },
    pagination: Pagination,
    query?: string,
  ): Promise<
    PaginatedResult<Customer & { accounts: Array<Account & { cards: Card[] }> }>
  >;
  abstract findByAffiliationCode(
    affiliationCode: string,
    app: string,
  ): Promise<Customer | null>;
}

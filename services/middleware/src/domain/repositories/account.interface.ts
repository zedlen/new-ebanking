import { Account } from '@middleware/domain/entities/account.entity';
import { Customer } from '@middleware/domain/entities/customers.entity';
import { Partner } from '@middleware/domain/entities/partners.entity';
import { Repository } from './repository.interface';

export interface AccountWithRelations extends Account {
  customer?: Customer;
  partner?: Partner;
}

export interface AccountWithCustomer extends Account {
  customer: Customer;
}

export abstract class AccountRepository extends Repository<Account> {
  abstract searchByQuery(query: string): Promise<Array<AccountWithRelations>>;
  abstract getPartnerSubaccounts(
    partnerId: string,
    app: string,
  ): Promise<Array<AccountWithCustomer>>;
  abstract findByCustomerIds(
    customerIds: string[],
    app: string,
  ): Promise<Account[]>;
}

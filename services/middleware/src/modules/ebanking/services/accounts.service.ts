import { AccountService } from '@middleware/application/services/accounts/accounts.service';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ValidateCustomer } from './validateCustomer.service';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountService: AccountService,
    private readonly validate: ValidateCustomer,
  ) {}

  getMyAccounts(
    info: HeadersInfo,
    pagination: Pagination,
    headers: Record<string, string>,
  ) {
    return this.accountService.fetchUserAccounts(
      info,
      info.userId,
      pagination,
      headers,
    );
  }

  async getMyAccount(
    info: HeadersInfo,
    accountId: string,
    headers: Record<string, string>,
  ) {
    const account = await this.accountService.fetchAccountById(
      info,
      accountId,
      headers,
    );
    if (!account) throw new NotFoundException('Account not exits');
    await this.validate.validateCustomerOwnership(
      info,
      account.customer_id,
      headers,
    );
    return account;
  }

  async getCustomerAccounts(
    info: HeadersInfo,
    customerId: string,
    pagination: Pagination,
    headers: Record<string, string>,
  ) {
    await this.validate.validateCustomerOwnership(info, customerId, headers);
    return this.accountService.fetchUserAccounts(
      info,
      customerId,
      pagination,
      headers,
    );
  }

  getFavorites(info: HeadersInfo, headers) {
    return this.accountService.fetchAccountFavorites(
      info,
      info.userId,
      headers,
    );
  }
}

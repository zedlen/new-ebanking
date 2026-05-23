import { AccountService } from '@middleware/application/services/accounts/accounts.service';
import { MovementService } from '@middleware/application/services/movements/movements.service';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ValidateCustomer } from './validateCustomer.service';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { MovementsFilter } from '@middleware/domain/repositories/MovementsFilter.interface';

@Injectable()
export class MovementsService {
  constructor(
    private readonly movementService: MovementService,
    private readonly accountService: AccountService,
    private readonly validate: ValidateCustomer,
  ) {}

  async getLastestMovements(
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
    const { data } = await this.movementService.fetchAccountMovementsPaged(
      info,
      accountId,
      { offset: 0, limit: 5 },
      {},
      headers,
    );
    return data;
  }

  async getMovements(
    info: HeadersInfo,
    accountId: string,
    pagination: Pagination,
    filters: MovementsFilter,
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
    return this.movementService.fetchAccountMovementsFiltered(
      info,
      accountId,
      pagination,
      filters,
      headers,
    );
  }

  getBanks(info: HeadersInfo, headers: Record<string, string>) {
    return this.movementService.getAvailableBanks(info, headers);
  }
}

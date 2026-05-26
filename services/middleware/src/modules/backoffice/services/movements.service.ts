import { MovementService } from '@middleware/application/services/movements/movements.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidateCustomerOwnership } from './validateCustomerOwnership';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { AccountService } from '@middleware/application/services/accounts/accounts.service';

@Injectable()
export class MovementsService {
  constructor(
    private readonly movementService: MovementService,
    private readonly accountService: AccountService,
    private readonly validateCustomerOwnership: ValidateCustomerOwnership,
  ) {}

  async getAccountMovements(
    info: HeadersInfo,
    customerId: string,
    accountId: string,
    pagination: Pagination,
    headers: Record<string, string>,
  ) {
    const customer = await this.validateCustomerOwnership.validate(
      info,
      customerId,
      info.userId,
      headers,
    );
    if (!customer) return { total: 0, data: [] };
    const account = await this.accountService.fetchAccountById(
      info,
      accountId,
      headers,
    );
    if (!account) return { total: 0, data: [] };
    if (account.customer_id !== customer.external_id)
      return { total: 0, data: [] };
    return this.movementService.fetchAccountMovementsFiltered(
      info,
      account.external_id,
      pagination,
      {},
      headers,
    );
  }

  async getMovementDetail(
    info: HeadersInfo,
    customerId: string,
    accountId: string,
    movementId: string,
    headers: Record<string, string>,
  ) {
    const customer = await this.validateCustomerOwnership.validate(
      info,
      customerId,
      info.userId,
      headers,
    );
    if (!customer) throw new BadRequestException(0);
    const account = await this.accountService.fetchAccountById(
      info,
      accountId,
      headers,
    );
    if (!account) throw new BadRequestException(0);
    if (account.customer_id !== customer.external_id)
      throw new BadRequestException(0);

    return this.movementService.getMovementDetail(info, movementId, headers);
  }
}

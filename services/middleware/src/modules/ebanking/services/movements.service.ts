import { AccountService } from '@middleware/application/services/accounts/accounts.service';
import { MovementService } from '@middleware/application/services/movements/movements.service';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ValidateCustomer } from './validateCustomer.service';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { MovementsFilter } from '@middleware/domain/repositories/MovementsFilter.interface';
import { getKubitOtpCode } from '@middleware/domain/utils/getOtpCode';
import { SPEI } from '@middleware/domain/repositories/spei.interface';
import { Transfer } from '@middleware/domain/repositories/transfer.interface';
import { getExcelContent } from '@middleware/domain/utils/getExcelInformation';

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

  getSavedSpei(
    info: HeadersInfo,
    status: number,
    headers: Record<string, string>,
  ) {
    return this.movementService.getSavedSpei(info, status, headers);
  }

  getSavedTransfers(
    info: HeadersInfo,
    status: number,
    headers: Record<string, string>,
  ) {
    return this.movementService.getSavedTransfers(info, status, headers);
  }

  createSpeiTemplate(
    info: HeadersInfo,
    file: Express.Multer.File,
    data: { payerAccount: string; account_id?: string },
    headers: Record<string, string>,
  ) {
    return this.movementService.saveMovementsSpeiTemplate(
      info,
      file,
      data,
      getKubitOtpCode(headers),
      headers,
    );
  }

  createTransfersTemplate(
    info: HeadersInfo,
    file: Express.Multer.File,
    data: { payerAccount: string; account_id?: string },
    headers: Record<string, string>,
  ) {
    return this.movementService.saveMovementsTransferTemplate(
      info,
      file,
      data,
      getKubitOtpCode(headers),
      headers,
    );
  }

  saveSpei(
    info: HeadersInfo,
    data: SPEI & { account_id?: string },
    headers: Record<string, string>,
  ) {
    return this.movementService.saveMovementSpei(
      info,
      data,
      getKubitOtpCode(headers),
      headers,
    );
  }

  saveTransfer(
    info: HeadersInfo,
    data: Transfer,
    headers: Record<string, string>,
  ) {
    return this.movementService.saveTransfer(
      info,
      data,
      getKubitOtpCode(headers),
      headers,
    );
  }

  processSavedSpei(
    info: HeadersInfo,
    data: { selected_order_ids: string[] },
    headers,
  ) {
    return this.movementService.processSavedSpei(
      info,
      data,
      getKubitOtpCode(headers),
      headers,
    );
  }

  processSavedTransfer(
    info: HeadersInfo,
    data: { selected_order_ids: string[] },
    headers,
  ) {
    return this.movementService.processSavedTransfer(
      info,
      data,
      getKubitOtpCode(headers),
      headers,
    );
  }

  createSpei(
    info: HeadersInfo,
    data: SPEI & { account_id?: string },
    headers: Record<string, string>,
  ) {
    return this.movementService.createMovementSpei(
      info,
      data,
      getKubitOtpCode(headers),
      headers,
    );
  }

  createTransfer(
    info: HeadersInfo,
    data: Transfer,
    headers: Record<string, string>,
  ) {
    return this.movementService.createTransfer(
      info,
      data,
      getKubitOtpCode(headers),
      headers,
    );
  }

  async previewSpeiTemplate(file: Express.Multer.File) {
    const data = await getExcelContent(file);
    if (!Array.isArray(data)) return [];
    const filterData = data.slice(5);
    return filterData.map((row, index) => {
      if (!Array.isArray(row)) return null;
      return {
        line: index + 5,
        beneficiary_account: row[1] as string,
        concept: row[2] as string,
        amount: row[3] as string,
        beneficiary_name: row[4] as string,
        beneficiary_uid: row[5] as string,
        beneficiary_email: row[6] as string,
        numerical_reference: row[7] as string,
      };
    });
  }
  async previewTransfersTemplate(file: Express.Multer.File) {
    const data = await getExcelContent(file);
    if (!Array.isArray(data)) return [];
    const filterData = data.slice(5);
    return filterData.map((row, index) => {
      if (!Array.isArray(row)) return null;
      return {
        line: index + 5,
        beneficiary_account: row[1] as string,
        concept: row[2] as string,
        amount: row[3] as string,
        beneficiary_name: row[4] as string,
      };
    });
  }
}

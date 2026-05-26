import { MovementRepository } from '@middleware/domain/repositories/movement.interface';
import { MovementsFilter } from '@middleware/domain/repositories/MovementsFilter.interface';
import {
  PaginatedResult,
  Pagination,
} from '@middleware/domain/interfaces/pagination.interface';
import { SPEI } from '@middleware/domain/repositories/spei.interface';
import { Transfer } from '@middleware/domain/repositories/transfer.interface';
import { KubitRequest } from '@middleware/infrastructure/providers/kubit-request';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { getMonthsBetweenDates } from '@middleware/domain/utils/getMonthAndYearsOnDates';
import {
  Movement,
  MovementDetail,
} from '@middleware/domain/entities/movement.entity';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { Bank } from '@middleware/domain/entities/bank.entity';

@Injectable()
export class MovementService {
  private readonly logger = new Logger(MovementService.name);
  constructor(
    private readonly kubitRequest: KubitRequest,
    private readonly movementRepository: MovementRepository,
  ) {}

  async getMovementsHistory(
    { appUrl, apiKey, userToken }: HeadersInfo,
    accountId: string,
    start: Date,
    end: Date,
    headers: Record<string, string>,
  ): Promise<Movement[]> {
    const dates = getMonthsBetweenDates(start, end);
    const movements: Movement[] = [];
    try {
      for (const date of dates) {
        const movementsUrl = `/accounts/${accountId}/statement-account?month=${date.month}&year=${date.year}`;
        const { data } = (await this.kubitRequest.getRequest(
          appUrl,
          movementsUrl,
          apiKey,
          userToken,
          headers,
        )) as { data: { movements: Movement[] } };
        movements.push(...(data.movements ?? []));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error({
        error: errorMessage,
        msg: `Error while retriving history movements for account ${accountId}`,
      });
    }
    return movements;
  }

  async syncMovement(movement: Movement, headers: Record<string, string>) {
    if (!movement?.id) return null;

    const dbMovement = await this.movementRepository.findOne({
      external_id: movement.id,
      app: headers['APP_NAME'],
    });
    const { id, ...movementData } = movement;
    if (!dbMovement) {
      return this.movementRepository.save({
        ...movementData,
        external_id: id,
        app: headers['APP_NAME'],
      });
    }
    await this.movementRepository.update(dbMovement.id as string, {
      ...movementData,
      external_id: id,
    });
    return this.movementRepository.get(dbMovement.id as string);
  }

  async getMovementDetail(
    { appUrl, apiKey, userToken }: HeadersInfo,
    movementId: string,
    headers: Record<string, string>,
  ) {
    const responseMovementInfo = (await this.kubitRequest.getRequest(
      appUrl,
      `/accounts/movements/${movementId}/detail`,
      apiKey,
      userToken,
      headers,
    )) as { data: MovementDetail[] };
    const { data: details = [] } = responseMovementInfo;
    const movement = await this.movementRepository.findOne({
      external_id: movementId,
      app: headers['APP_NAME'],
    });

    return { ...movement, details };
  }

  async fetchAccountMovements(
    { appUrl, apiKey, userToken }: HeadersInfo,
    accountId: string,
    headers: Record<string, string>,
  ): Promise<Movement[]> {
    const movement = await this.movementRepository.getLastMovements(accountId);
    const lastDay = new Date();
    const movementDate = movement
      ? new Date(movement?.operation_date)
      : new Date('2023-01-01');
    const movements = await this.getMovementsHistory(
      { appUrl, apiKey, userToken } as HeadersInfo,
      accountId,
      movementDate,
      lastDay,
      headers,
    );
    const results = await Promise.all(
      movements.map((movement: Movement) => {
        return this.syncMovement(movement, headers);
      }),
    );
    return results.filter((movement): movement is Movement => !!movement);
  }

  async fetchAccountMovementsPaged(
    { appUrl, apiKey, userToken }: HeadersInfo,
    accountId: string,
    pagination: Pagination,
    filter: { [key: string]: string | number | boolean },
    headers: Record<string, string>,
  ): Promise<PaginatedResult<Movement>> {
    const movement = await this.movementRepository.getLastMovements(accountId);
    const lastDay = new Date();
    const movementDate = movement
      ? new Date(movement?.operation_date)
      : new Date('2023-01-01');
    const movements = await this.getMovementsHistory(
      { appUrl, apiKey, userToken } as HeadersInfo,
      accountId,
      movementDate,
      lastDay,
      headers,
    );
    await Promise.all(
      movements.map((movement: Movement) => {
        return this.syncMovement(movement, headers);
      }),
    );
    return this.movementRepository.find(
      { ...filter, account_id: accountId },
      pagination,
    );
  }

  async fetchAccountMovementsFiltered(
    { appUrl, apiKey, userToken }: HeadersInfo,
    accountId: string,
    pagination: Pagination,
    filter: MovementsFilter,
    headers: Record<string, string>,
  ): Promise<PaginatedResult<Movement>> {
    const movement = await this.movementRepository.getLastMovements(accountId);
    const lastDay = new Date();
    const movementDate = movement
      ? new Date(movement?.operation_date)
      : new Date('2023-01-01');
    const movements = await this.getMovementsHistory(
      { appUrl, apiKey, userToken } as HeadersInfo,
      accountId,
      movementDate,
      lastDay,
      headers,
    );
    await Promise.all(
      movements.map((movement: Movement) => {
        return this.syncMovement(movement, headers);
      }),
    );
    return this.movementRepository.filterMovements(
      accountId,
      filter,
      pagination,
    );
  }

  private async getClabeFromAccountId(
    { appUrl, apiKey, userToken },
    clabe: string,
    headers: Record<string, string>,
  ) {
    const { data: account } = (await this.kubitRequest.getRequest(
      appUrl,
      `/accounts/${clabe}`,
      apiKey,
      userToken,
      headers,
    )) as { data: { clabes: { clabe: string }[] } };

    return account?.clabes?.[0]?.clabe;
  }

  async createMovementSpei(
    { appUrl, apiKey, userToken }: HeadersInfo,
    data: SPEI & { account_id?: string },
    otp: string,
    headers: Record<string, string>,
  ) {
    if (data.account_id) {
      const clabe = await this.getClabeFromAccountId(
        { appUrl, apiKey, userToken },
        data.account_id,
        headers,
      );
      data.payer_account = clabe ?? data.payer_account;
      data.payer_account = clabe;
      delete data.account_id;
    }
    const responseMovementInfo = await this.kubitRequest.postRequest(
      appUrl,
      `/spei`,
      apiKey,
      userToken,
      data,
      otp,
      headers,
    );
    return responseMovementInfo;
  }

  async saveMovementSpei(
    { appUrl, apiKey, userToken }: HeadersInfo,
    data: SPEI & { account_id?: string },
    otp: string,
    headers: Record<string, string>,
  ) {
    if (data.account_id) {
      const clabe = await this.getClabeFromAccountId(
        { appUrl, apiKey, userToken },
        data.account_id,
        headers,
      );
      data.payer_account = clabe ?? data.payer_account;
      delete data.account_id;
    }
    const responseMovementInfo = await this.kubitRequest.postRequest(
      appUrl,
      `/spei/save`,
      apiKey,
      userToken,
      data,
      otp,
      headers,
    );
    return responseMovementInfo;
  }

  async saveMovementsSpeiTemplate(
    { appUrl, apiKey, userToken }: HeadersInfo,
    file: Express.Multer.File,
    data: { payerAccount: string; account_id?: string },
    otp: string,
    headers: Record<string, string>,
  ) {
    if (!file) throw new BadRequestException('template is missing on request');

    const clabe = await this.getClabeFromAccountId(
      { appUrl, apiKey, userToken },
      data.account_id as string,
      headers,
    );
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const FormData = require('form-data');
    const data2send = new FormData();
    data2send.append('payerAccount', clabe ?? data?.payerAccount);
    data2send.append(file.fieldname, file.buffer, {
      filename: file.originalname,
    });
    this.logger.log({
      msg: 'Sending SPEI bulk template',
      data: {
        payerAccount: clabe ?? data?.payerAccount,
        filename: file.originalname,
      },
      clabe,
    });
    const responseMovementInfo = await this.kubitRequest.postRequest(
      appUrl,
      `/spei/save/template`,
      apiKey,
      userToken,
      data2send,
      otp,
      headers,
    );
    return responseMovementInfo;
  }

  async getSavedSpei(
    { appUrl, apiKey, userToken }: HeadersInfo,
    status: number,
    headers: Record<string, string>,
  ) {
    const response = await this.kubitRequest.getRequest(
      appUrl,
      `/spei/orders/saved?status=${status}`,
      apiKey,
      userToken,
      headers,
    );
    return response;
  }

  async processSavedSpei(
    { appUrl, apiKey, userToken }: HeadersInfo,
    data: { selected_order_ids: string[] },
    otp: string,
    headers: Record<string, string>,
  ) {
    const responseMovementInfo = await this.kubitRequest.postRequest(
      appUrl,
      `/spei/orders/saved/process`,
      apiKey,
      userToken,
      data,
      otp,
      headers,
    );
    return responseMovementInfo;
  }

  async getMovementCep(
    { appUrl, apiKey, userToken }: HeadersInfo,
    movementId: string,
    headers: Record<string, string>,
  ) {
    const response = await this.kubitRequest.getRequest(
      appUrl,
      `/spei/orders/${movementId}/cep`,
      apiKey,
      userToken,
      headers,
    );
    return response;
  }

  async getAvailableBanks(
    { appUrl, apiKey, userToken }: HeadersInfo,
    headers: Record<string, string>,
  ) {
    const response = (await this.kubitRequest.getRequest(
      appUrl,
      `/spei/banks`,
      apiKey,
      userToken,
      headers,
    )) as {
      code: number;
      status: string;
      data: Array<Bank>;
    };
    return response;
  }

  async createTransfer(
    { appUrl, apiKey, userToken }: HeadersInfo,
    data: Transfer,
    otp: string,
    headers: Record<string, string>,
  ) {
    const response = await this.kubitRequest.postRequest(
      appUrl,
      `/transfers`,
      apiKey,
      userToken,
      data,
      otp,
      headers,
    );
    return response;
  }

  async getSavedTransfers(
    { appUrl, apiKey, userToken }: HeadersInfo,
    status: number,
    headers: Record<string, string>,
  ) {
    const response = await this.kubitRequest.getRequest(
      appUrl,
      `/transfers/saved?status=${status}`,
      apiKey,
      userToken,
      headers,
    );
    return response;
  }

  async saveTransfer(
    { appUrl, apiKey, userToken }: HeadersInfo,
    data: Transfer,
    otp: string,
    headers: any,
  ) {
    const responseMovementInfo = await this.kubitRequest.postRequest(
      appUrl,
      `/transfers/save`,
      apiKey,
      userToken,
      data,
      otp,
      headers,
    );
    return responseMovementInfo;
  }

  async saveMovementsTransferTemplate(
    { appUrl, apiKey, userToken }: HeadersInfo,
    file: Express.Multer.File,
    data: { payerAccount: string },
    otp: string,
    headers: any,
  ) {
    if (!file) throw new BadRequestException('template is missing on request');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const FormData = require('form-data');
    const data2send = new FormData();
    data2send.append('payerAccount', data?.payerAccount);
    data2send.append(file.fieldname, file.buffer, {
      filename: file.originalname,
    });
    const responseMovementInfo = await this.kubitRequest.postRequest(
      appUrl,
      `/transfers/save/template`,
      apiKey,
      userToken,
      data2send,
      otp,
      headers,
    );
    return responseMovementInfo;
  }

  async processSavedTransfer(
    { appUrl, apiKey, userToken }: HeadersInfo,
    data: { selected_order_ids: string[] },
    otp: string,
    headers: any,
  ) {
    const responseMovementInfo = await this.kubitRequest.postRequest(
      appUrl,
      `/transfers/saved/process`,
      apiKey,
      userToken,
      data,
      otp,
      headers,
    );
    return responseMovementInfo;
  }
}

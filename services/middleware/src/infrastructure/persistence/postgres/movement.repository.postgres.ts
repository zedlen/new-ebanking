import { Movement } from '@middleware/domain/schemas/movement.entity';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { MovementRepository } from '@middleware/domain/repositories/movement.interface';
import { Movement as MovementSchema } from '@middleware/domain/schemas/movement.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovementsFilter } from '@middleware/domain/repositories/MovementsFilter.interface';

@Injectable()
export class MovementPostgresRepository extends MovementRepository {
  constructor(
    @InjectRepository(MovementSchema)
    private movementModel: Repository<MovementSchema>,
  ) {
    super();
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination: Pagination,
  ): Promise<{ total: number; data: Movement[] }> {
    const [data, total] = await this.movementModel.findAndCount({
      where: params,
      order: {
        operation_date: 'DESC',
      },
      skip: pagination.offset,
      take: pagination.limit,
    });
    return { total, data };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<Movement | null> {
    return await this.movementModel.findOne({
      where: params,
      order: {
        operation_date: 'DESC',
      },
    });
  }

  async get(id: string): Promise<Movement | null> {
    return await this.movementModel.findOneBy({ id });
  }

  async getAll(): Promise<{ total: number; data: Movement[] }> {
    const [data, total] = await this.movementModel.findAndCount({
      order: {
        operation_date: 'DESC',
      },
    });
    return { total, data };
  }

  async save(item: Movement): Promise<Movement> {
    const movement = await this.movementModel.save(item);
    return {
      id: movement.id,
      external_id: movement.external_id,
      account_id: movement.account_id,
      type: movement.type,
      description: movement.description,
      amount: movement.amount,
      folio: movement.folio,
      status: movement.status,
      operation_date: movement.operation_date,
      application_date: movement.application_date,
      origin_bank_id: movement.origin_bank_id,
      payer_name: movement.payer_name,
      payer_account: movement.payer_account,
      destination_bank_id: movement.destination_bank_id,
      beneficiary_name: movement.beneficiary_name,
      beneficiary_account: movement.beneficiary_account,
      payment_purpose: movement.payment_purpose,
      reference: movement.reference,
      tracking_key: movement.tracking_key,
      app: movement.app,
    };
  }

  async update(id: string, item: Partial<Movement>): Promise<boolean> {
    const movement = await this.movementModel.preload({ id, ...item });
    if (!movement) {
      return false;
    }
    await this.movementModel.save(movement);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.movementModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.movementModel.count({ where: params });
  }

  getLastMovements(accountId: string): Promise<Movement | null> {
    return this.movementModel.findOne({
      where: { account_id: accountId },
      order: { operation_date: 'DESC' },
    });
  }

  getByQuery(
    accountId: string,
    query: string,
    pagination?: Pagination,
  ): Promise<{ total: number; data: Movement[] }> {
    const results = this.movementModel
      .createQueryBuilder('movement')
      .where('movement.account_id = :accountId', { accountId })
      .andWhere(
        '(movement.description ILIKE :query OR movement.payer_name ILIKE :query OR movement.beneficiary_name ILIKE :query OR movement.reference::text ILIKE :query OR movement.folio ILIKE :query OR movement.tracking_key ILIKE :query OR movement.payment_purpose ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('movement.operation_date', 'DESC');

    if (pagination) {
      results.skip(pagination.offset).take(pagination.limit);
    }

    return results.getManyAndCount().then(([data, total]) => ({ total, data }));
  }

  async filterMovements(
    accountId: string,
    filter: MovementsFilter,
    pagination: Pagination,
  ): Promise<{ total: number; data: Movement[] }> {
    const query = this.movementModel.createQueryBuilder('movement');
    query.where('movement.account_id = :accountId', { accountId });

    if (filter?.startDate) {
      query.andWhere('movement.operation_date >= :startDate', {
        startDate: filter.startDate,
      });
    }

    if (filter?.endDate) {
      query.andWhere('movement.operation_date <= :endDate', {
        endDate: filter.endDate,
      });
    }

    if (filter?.type) {
      query.andWhere('movement.type = :type', { type: filter.type });
    }

    if (filter?.status) {
      query.andWhere('movement.status = :status', { status: filter.status });
    }

    query.orderBy('movement.operation_date', 'DESC');

    if (pagination) {
      query.skip(pagination.offset).take(pagination.limit);
    }

    const [data, total] = await query.getManyAndCount();

    return { total, data };
  }
}

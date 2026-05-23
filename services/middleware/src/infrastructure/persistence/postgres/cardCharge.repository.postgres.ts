import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CardCharge } from '@middleware/domain/entities/cardCharge.entity';
import { CardChargeRepository } from '@middleware/domain/repositories/cardCharge.interface';
import {
  Pagination,
  PaginatedResult,
} from '@middleware/domain/interfaces/pagination.interface';
import { CardCharge as CardChargeSchema } from '@middleware/domain/schemas/cardCharge.entity';

@Injectable()
export class CardChargePostgresRepository extends CardChargeRepository {
  constructor(
    @InjectRepository(CardChargeSchema)
    private readonly model: Repository<CardChargeSchema>,
  ) {
    super();
  }

  private map(entity: CardChargeSchema | null): CardCharge | null {
    if (!entity) return null;

    return {
      id: entity.id,
      ts: entity.ts.toISOString(),
      'ts-cst': entity.tsCst.toISOString(),
      request_headers: entity.request_headers,
      request: entity.request,
      customer: entity.customer,
      response: entity.response,
    };
  }

  private mapMany(entities: CardChargeSchema[]): CardCharge[] {
    return entities.map((e) => this.map(e)).filter((e) => e !== null);
  }

  async find(
    params: { [key: string]: string | number | boolean },
    pagination?: Pagination,
  ): Promise<PaginatedResult<CardCharge>> {
    const [entities, total] = await this.model.findAndCount({
      where: params,
      order: { ts: 'DESC' },
      skip: pagination?.offset,
      take: pagination?.limit,
    });

    return {
      total,
      data: this.mapMany(entities),
    };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<CardCharge | null> {
    const entity = await this.model.findOne({ where: params });
    return this.map(entity);
  }

  async get(id: string): Promise<CardCharge | null> {
    const entity = await this.model.findOneBy({ id });
    return this.map(entity);
  }

  async getAll(pagination?: Pagination): Promise<PaginatedResult<CardCharge>> {
    return this.find({}, pagination);
  }

  async save(item: CardCharge): Promise<CardCharge> {
    const saved = await this.model.save({
      ...item,
      tsCst: item['ts-cst'],
    });
    return this.map(saved) as CardCharge;
  }

  async bulkInsert(items: CardCharge[]): Promise<number> {
    const entities = await Promise.all(
      items.map((item) =>
        this.model.save({
          ...item,
          tsCst: item['ts-cst'],
        }),
      ),
    );

    return entities.length;
  }

  async update(id: string, item: Partial<CardCharge>): Promise<boolean> {
    await this.model.update({ id }, item);
    return true;
  }

  async softDelete(
    item: Partial<Omit<CardCharge, 'ts-cst' | 'ts'>>,
  ): Promise<boolean> {
    await this.model.update(item, { active: false } as any);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.model.delete({ id });
    return true;
  }

  async count(params: {
    [key: string]: string | number | boolean;
  }): Promise<number> {
    return this.model.count({ where: params });
  }

  async findByCustomer(
    customer: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<CardCharge>> {
    return this.find({ customer }, pagination);
  }

  async findByDateRange(
    from: Date,
    to: Date,
    pagination?: Pagination,
    customer?: string,
  ): Promise<PaginatedResult<CardCharge>> {
    const where: Record<string, any> = { ts: Between(from, to) };
    if (customer) where['customer'] = customer;
    return this.find(where, pagination);
  }

  async findRejected(pagination?: Pagination, customer?: string) {
    const qb = this.model
      .createQueryBuilder('charge')
      .where(`charge.response -> 'body' ->> 'response' != :status`, {
        status: 'APPROVED',
      });

    if (customer) qb.andWhere('charge.customer = :customer', { customer });

    qb.orderBy('charge.ts', 'DESC');

    if (pagination) qb.skip(pagination.offset).take(pagination.limit);

    const [data, total] = await qb.getManyAndCount();

    return { total, data: this.mapMany(data) };
  }

  async sumByDateRange(
    from: Date,
    to: Date,
    customer?: string,
  ): Promise<number> {
    const qb = this.model
      .createQueryBuilder('charge')
      .select(
        `SUM((charge.request -> 'body' -> 'values' ->> 'billing_value')::numeric)`,
        'total',
      )
      .where('charge.ts BETWEEN :from AND :to', { from, to });

    if (customer) qb.andWhere('charge.customer = :customer', { customer });

    const result = (await qb.getRawOne()) as { total: string | null };
    return Number(result?.total || 0);
  }

  async aggregateByDay(from: Date, to: Date, customer?: string) {
    const qb = this.model
      .createQueryBuilder('charge')
      .select(`DATE(charge.ts_cst)`, 'date')
      .addSelect(
        `SUM((charge.request -> 'body' -> 'values' ->> 'billing_value')::numeric)`,
        'total',
      )
      .where('charge.ts_cst BETWEEN :from AND :to', { from, to })
      .groupBy(`DATE(charge.ts_cst)`)
      .orderBy('date', 'DESC');

    if (customer) qb.andWhere('charge.customer = :customer', { customer });

    const result = await qb.getRawMany();

    return result.map(
      (r: { date: string; customer: string; total: string }) => ({
        date: r.date,
        results: [
          {
            customer: r.customer,
            total: Number(r.total),
          },
        ],
      }),
    );
  }
  async aggregateByMonth(from: Date, to: Date, customer?: string) {
    const qb = this.model
      .createQueryBuilder('charge')
      .select(`TO_CHAR(charge.ts_cst, 'YYYY-MM')`, 'month')
      .addSelect(
        `SUM((charge.request -> 'body' -> 'values' ->> 'billing_value')::numeric)`,
        'total',
      )
      .where('charge.ts_cst BETWEEN :from AND :to', { from, to })
      .groupBy(`TO_CHAR(charge.ts_cst, 'YYYY-MM')`)
      .orderBy('month', 'DESC');

    if (customer) qb.andWhere('charge.customer = :customer', { customer });

    const result = await qb.getRawMany();

    return result.map((r: { month: string; total: string }) => ({
      month: r.month,
      total: Number(r.total),
    }));
  }

  async getClientsResumeByDateRange(
    from: Date,
    to: Date,
  ): Promise<
    Array<{
      customer: string;
      total: number;
      count: number;
    }>
  > {
    const result = await this.model
      .createQueryBuilder('charge')
      .select('charge.customer', 'customer')
      .addSelect(
        `SUM((charge.request -> 'body' -> 'values' ->> 'billing_value')::numeric)`,
        'total',
      )
      .addSelect('COUNT(*)', 'count')
      .where('charge.ts_cst BETWEEN :from AND :to', { from, to })
      .groupBy('charge.customer')
      .orderBy('total', 'DESC')
      .getRawMany();

    return result.map(
      (r: { customer: string; total: string; count: string }) => ({
        customer: r.customer,
        total: Number(r.total),
        count: Number(r.count),
      }),
    );
  }
}

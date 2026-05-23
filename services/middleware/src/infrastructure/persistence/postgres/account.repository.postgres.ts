import { Account } from '@middleware/domain/schemas/account.entity';
import { Customer } from '@middleware/domain/schemas/customer.entity';
import { Partner } from '@middleware/domain/schemas/partner.entity';
import { Customer as CustomerModel } from '@middleware/domain/entities/customers.entity';
import { Partner as PartnerModel } from '@middleware/domain/entities/partners.entity';
import {
  AccountRepository,
  AccountWithRelations,
  AccountWithCustomer,
} from '@middleware/domain/repositories/account.interface';
import {
  PaginatedResult,
  Pagination,
} from '@middleware/domain/interfaces/pagination.interface';
import { Account as AccountSchema } from '@middleware/domain/entities/account.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class AccountPostgresRepository extends AccountRepository {
  constructor(
    @InjectRepository(Account)
    private accountModel: Repository<AccountSchema>,
  ) {
    super();
  }

  private transforData(
    results: AccountSchema | AccountSchema[] | undefined,
  ): Account | Account[] | null {
    if (!results) return null;
    if (Array.isArray(results))
      return results?.map((account) => ({
        id: account.id as string,
        type: account.type,
        amount: account.amount,
        currency: account.currency,
        linked_cellphone: account.linked_cellphone,
        customer_id: account.customer_id,
        alias: account.alias,
        creation_date: account.creation_date,
        external_id: account.external_id,
        app: account.app,
        clabes:
          account.clabes?.map((clabe) => ({
            id: clabe.id,
            payment_provider_id: clabe.payment_provider_id,
            account_id: clabe.account_id,
            clabe: clabe.clabe,
            cc: clabe.cc,
          })) ?? [],
      }));
    return {
      id: results.id as string,
      type: results.type,
      amount: results.amount,
      currency: results.currency,
      linked_cellphone: results.linked_cellphone,
      customer_id: results.customer_id,
      alias: results.alias,
      creation_date: results.creation_date,
      external_id: results.external_id,
      app: results.app,
      clabes:
        results.clabes?.map((clabe) => ({
          id: clabe.id,
          payment_provider_id: clabe.payment_provider_id,
          account_id: clabe.account_id,
          clabe: clabe.clabe,
          cc: clabe.cc,
        })) ?? [],
    };
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination?: Pagination,
  ): Promise<PaginatedResult<Account>> {
    const [data, total] = await this.accountModel.findAndCount({
      where: params,
      ...(pagination && {
        skip: pagination.offset,
        take: pagination.limit,
      }),
    });

    return { total, data: this.transforData(data) as Account[] };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<Account> {
    const results = await this.accountModel.findOne({
      where: params,
    });
    if (!results) return null as unknown as Account;
    return this.transforData(results) as Account;
  }

  async get(id: string): Promise<Account | null> {
    const results = await this.accountModel.findOne({
      where: { id },
    });
    if (!results) return null;
    return this.transforData(results) as Account;
  }

  async getAll(
    pagination?: Pagination,
  ): Promise<{ total: number; data: Account[] }> {
    const [results, total] = await this.accountModel.findAndCount({
      ...(pagination && {
        skip: pagination.offset,
        take: pagination.limit,
      }),
    });

    const data = this.transforData(results) as Account[];

    return { total, data };
  }

  async save(item: Account): Promise<Account> {
    const saved = await this.accountModel.save(item);
    return this.transforData(saved) as Account;
  }

  async update(id: string, item: Partial<Account>): Promise<boolean> {
    const account = await this.accountModel.preload({ id, ...item });
    if (!account) return false;

    await this.accountModel.save(account);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.accountModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.accountModel.count({ where: params });
  }

  async searchByQuery(query: string): Promise<AccountWithRelations[]> {
    const results = (await this.accountModel
      .createQueryBuilder('account')
      .where('account.external_id ILIKE :query', { query: `%${query}%` })
      .orWhere('account.alias ILIKE :query', { query: `%${query}%` })
      .orWhere('clabe.clabe ILIKE :query', { query: `%${query}%` })
      .leftJoinAndMapOne(
        'account.customer_id',
        Customer,
        'customer',
        'customer.external_id = account.customer_id',
      )
      .leftJoinAndMapOne(
        'account.partner_id',
        Partner,
        'partner',
        'partner.external_id = account.partner_id',
      )
      .getMany()) as Array<
      AccountSchema & { customer?: unknown; partner?: unknown }
    >;

    const mappedResults = results.map((account) => {
      const data = this.transforData(account) as Account;
      const customer = account['customer']
        ? (account['customer'] as unknown as CustomerModel)
        : undefined;
      const partner = account['partner']
        ? (account['partner'] as unknown as PartnerModel)
        : undefined;

      return { ...data, customer, partner };
    });
    return mappedResults;
  }

  async getPartnerSubaccounts(
    partnerId: string,
    app: string,
  ): Promise<AccountWithCustomer[]> {
    const results = await this.accountModel
      .createQueryBuilder('account')
      .leftJoinAndMapOne(
        'account.customer_id',
        Customer,
        'customer',
        'customer.external_id = account.customer_id',
      )
      .where('customer.account_customer_id = :partnerId', { partnerId })
      .andWhere('account.app = :app', { app })
      .getMany();

    return results.map((account) => {
      const transformed = this.transforData(account) as Account;
      const customer = account['customer'] as unknown as CustomerModel;

      return {
        ...transformed,
        customer,
      };
    });
  }

  async findByCustomerIds(customerIds: string[]): Promise<Account[]> {
    const results = await this.accountModel.find({
      where: { customer_id: In(customerIds) },
    });
    return this.transforData(results) as Account[];
  }
}

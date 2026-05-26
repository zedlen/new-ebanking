import { Customer } from '@middleware/domain/entities/customers.entity';
import { Partner } from '@middleware/domain/entities/partners.entity';
import { CustomerRepository } from '@middleware/domain/repositories/customer.interface';
import {
  PaginatedResult,
  Pagination,
} from '@middleware/domain/interfaces/pagination.interface';

import { Customer as CustomerSchema } from '@middleware/domain/schemas/customer.entity';
import { Partner as PartnerSchema } from '@middleware/domain/schemas/partner.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Account } from '@middleware/domain/entities/account.entity';
import { Card } from '@middleware/domain/entities/card.entity';
import {
  Account as AccountSchema,
  Card as CardSchema,
} from '@middleware/domain/schemas';

@Injectable()
export class CustomerPostgresRepository extends CustomerRepository {
  constructor(
    @InjectRepository(CustomerSchema)
    private customerModel: Repository<CustomerSchema>,
    @InjectRepository(PartnerSchema)
    private partnerModel: Repository<PartnerSchema>,
  ) {
    super();
  }

  private transforData(
    results: CustomerSchema | CustomerSchema[] | undefined,
  ): Customer | Customer[] | null {
    if (!results) {
      return null;
    }
    if (Array.isArray(results)) {
      return results.map((result) => ({
        id: result.id,
        external_id: result.external_id,
        parent_id: result.parent_id ?? '',
        account_customer_id: result.account_customer_id,
        level: result.level,
        rfc: result.rfc,
        company_name: result.company_name ?? '',
        name: result.name ?? '',
        ap_paterno: result.ap_paterno ?? '',
        ap_materno: result.ap_materno ?? '',
        taxpayer_type_id: result.taxpayer_type_id,
        address: result.address,
        contact_name: result.contact_name,
        contact_email: result.contact_email,
        contact_tel: result.contact_tel,
        creation_date: result.creation_date,
        image: result.image,
        address_id: result.address?.external_id,
        app: result.app,
      }));
    }
    return {
      id: results.id,
      external_id: results.external_id,
      parent_id: results.parent_id ?? '',
      account_customer_id: results.account_customer_id,
      level: results.level,
      rfc: results.rfc,
      company_name: results.company_name ?? '',
      name: results.name ?? '',
      ap_paterno: results.ap_paterno ?? '',
      ap_materno: results.ap_materno ?? '',
      taxpayer_type_id: results.taxpayer_type_id,
      address: results.address,
      contact_name: results.contact_name,
      contact_email: results.contact_email,
      contact_tel: results.contact_tel,
      creation_date: results.creation_date,
      image: results.image,
      address_id: results.address?.external_id,
      app: results.app,
    };
  }
  async find(
    params: {
      [key: string]: string | number | boolean | null;
    },
    pagination: Pagination,
  ): Promise<{ total: number; data: Customer[] }> {
    const paramsWhere = {};
    for (const key in params) {
      if (Array.isArray(params[key])) {
        paramsWhere[key] = In(params[key]);
      } else if (params[key] === null) {
        paramsWhere[key] = IsNull();
      } else {
        paramsWhere[key] = params[key];
      }
    }
    const [data, total] = await this.customerModel.findAndCount({
      where: paramsWhere,
      skip: pagination.offset,
      take: pagination.limit,
    });

    return {
      total,
      data: data.map((item) => this.transforData(item)) as Customer[],
    };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<Customer | null> {
    const customer = await this.customerModel.findOne({ where: params });
    if (!customer) {
      return null;
    }
    return this.transforData(customer) as Customer;
  }

  async findByExternalIds(ids: string[]): Promise<Customer[]> {
    const customers = await this.customerModel.find({
      where: { external_id: In(ids) },
    });
    return customers.map((customer) =>
      this.transforData(customer),
    ) as Customer[];
  }

  async get(id: string): Promise<Customer | null> {
    const customer = await this.customerModel.findOneBy({ id });
    if (!customer) {
      return null;
    }
    return this.transforData(customer) as Customer;
  }

  async getAll(): Promise<{ total: number; data: Customer[] }> {
    const [data, total] = await this.customerModel.findAndCount();

    return {
      total,
      data: data.map((item) => this.transforData(item)) as Customer[],
    };
  }

  async save(item: Customer): Promise<Customer> {
    const customer = await this.customerModel.save(item);
    return this.transforData(customer) as Customer;
  }

  async update(id: string, item: Partial<Customer>): Promise<boolean> {
    const customer = await this.customerModel.preload({ id, ...item });
    if (!customer) {
      return false;
    }
    await this.customerModel.save(customer);
    return true;
  }
  async delete(id: string): Promise<boolean> {
    await this.customerModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.customerModel.count({ where: params });
  }

  async searchByQueryWallets(
    query: string,
  ): Promise<(Customer & { Customer: Customer; Partner: Partner })[]> {
    const wallets = await this.customerModel
      .createQueryBuilder('customer')
      .where('customer.name ILIKE :query', { query: `%${query}%` })
      .orWhere('customer.company_name ILIKE :query', { query: `%${query}%` })
      .orWhere('customer.rfc ILIKE :query', { query: `%${query}%` })
      .where('customer.parent_id IS NOT NULL')
      .getMany();
    const results = Promise.all(
      wallets.map(async (customer) => {
        const parentCustomer = await this.findOne({
          external_id: customer.parent_id!,
        });
        const customerData = this.transforData(customer) as Customer;
        const parentData = parentCustomer as Customer;
        const Partner = await this.searchCustomerPartners(customerData);
        return {
          ...customerData,
          Partner,
          Customer: parentData,
        };
      }),
    );
    return results;
  }

  async searchCustomerPartners(customer: Customer): Promise<Partner> {
    const partner = await this.partnerModel.findOne({
      where: { external_id: customer.account_customer_id },
    });

    if (!partner) {
      throw new Error(
        `Partner with external_id ${customer.account_customer_id} not found`,
      );
    }
    return {
      id: partner.id,
      external_id: partner.external_id,
      rfc: partner.rfc,
      company_name: partner.company_name,
      economic_activity: partner.economic_activity,
      business_activity: partner.business_activity,
      taxpayer_type_id: partner.taxpayer_type_id,
      company_address_id: partner.company_address?.external_id ?? 0,
      company_address: partner.company_address,
      address: partner.address,
      contact_name: partner.contact_name,
      contact_email: partner.contact_email,
      contact_tel: partner.contact_tel,
      company_tel: partner.company_tel,
      status: partner.status,
      creation_date: partner.creation_date,
      modification_date: partner.modification_date,
      image: partner.image,
      customer_type: partner.customer_type,
      email: partner.email,
      blocked: partner.blocked,
      username: partner.username,
      role_id: partner.role_id,
      otp: partner.otp,
      affiliation_code: partner.affiliation_code,
      review_date: partner.review_date ?? '',
      process_date: partner.process_date ?? '',
      app: partner.app,
    };
  }

  async searchByQuery(
    query: string,
  ): Promise<(Customer & { Partner: Partner })[]> {
    const customers = await this.customerModel
      .createQueryBuilder('customer')
      .where('customer.name ILIKE :query', { query: `%${query}%` })
      .where('customer.parent_id IS NULL')
      .orWhere('customer.company_name ILIKE :query', { query: `%${query}%` })
      .orWhere('customer.rfc ILIKE :query', { query: `%${query}%` })
      .getMany();
    const results = Promise.all(
      customers.map(async (customer) => {
        const constumerData = this.transforData(customer) as Customer;
        const Partner = await this.searchCustomerPartners(constumerData);
        return { ...constumerData, Partner };
      }),
    );
    return results;
  }

  async getCustomerAffiliations(
    filters: { [key: string]: string },
    pagination: Pagination,
    query?: string,
  ): Promise<
    PaginatedResult<Customer & { accounts: Array<Account & { cards: Card[] }> }>
  > {
    const q = this.customerModel
      .createQueryBuilder('customer')
      .leftJoinAndMapOne(
        'customer.accounts',
        AccountSchema,
        'account',
        'account.customer_id = customer.external_id',
      )
      .leftJoinAndMapMany(
        'account.cards',
        CardSchema,
        'card',
        'card.account_id = account.external_id',
      )
      .where(filters)
      .skip(pagination.offset)
      .take(pagination.limit);

    if (query) {
      q.andWhere(
        '(customer.name ILIKE :query OR customer.company_name ILIKE :query OR customer.contact_email ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    const [data, total] = await q.getManyAndCount();
    return {
      data: data as Array<
        Customer & { accounts: Array<Account & { cards: Card[] }> }
      >,
      total,
    };
  }

  findByAffiliationCode(
    affiliationCode: string,
    app: string,
  ): Promise<Customer | null> {
    return this.customerModel
      .createQueryBuilder('customer')
      .where(
        'customer.affiliation_code = :affiliationCode OR customer.external_id = :affiliationCode',
        { affiliationCode },
      )
      .andWhere('partner.app = :app', { app })
      .getOne();
  }
}

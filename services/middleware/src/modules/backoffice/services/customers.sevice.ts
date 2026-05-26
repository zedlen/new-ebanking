import { CustomerService } from '@middleware/application/services/customers/customers.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ValidateCustomerOwnership } from './validateCustomerOwnership';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { AccountService } from '@middleware/application/services/accounts/accounts.service';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customerService: CustomerService,
    private readonly accountService: AccountService,
    private readonly validateCustomerOwnership: ValidateCustomerOwnership,
    @InjectQueue('sync-partners') private readonly syncPartners: Queue,
  ) {}

  async getUserPartners(
    info: HeadersInfo,
    userId: string,
    pagination: Pagination,
    headers: Record<string, string>,
  ) {
    const { data, total } =
      await this.validateCustomerOwnership.getAsignedPartners(
        userId,
        pagination,
      );
    const partners = await Promise.all(
      data.map(async (partner) => {
        const accounts = await this.accountService.fetchUserAccounts(
          info,
          partner.external_id,
          { limit: 2, offset: 0 },
          headers,
        );
        return { ...partner, accounts };
      }),
    );
    return { total, data: partners };
  }

  async syncAllData(info: HeadersInfo, headers: Record<string, string>) {
    const { id } = await this.syncPartners.add(
      'sync-partners',
      {
        headers: headers,
        headersInfo: info,
      },
      { removeOnComplete: true, removeOnFail: true },
    );
    return id;
  }

  async getCustomers(
    info: HeadersInfo,
    customerId: string,
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
    const filters: Record<string, string | null> = {
      app: info.appName,
    };
    if ('economic_activity' in customer) {
      filters.parent_id = null;
      filters.account_customer_id = customer.external_id;
    }

    if ('account_customer_id' in customer) {
      filters.parent_id = customer.external_id;
    }

    const { data, total } = await this.customerService.findCustomers(
      filters,
      pagination,
    );
    const customers = await Promise.all(
      data.map(async (customer) => {
        const accounts = await this.accountService.fetchUserAccounts(
          info,
          customer.external_id,
          { limit: 2, offset: 0 },
          headers,
        );
        return { ...customer, accounts };
      }),
    );
    return { total, data: customers };
  }

  async getCustomer(
    info: HeadersInfo,
    customerId: string,
    headers: Record<string, string>,
  ) {
    const customer = await this.validateCustomerOwnership.validate(
      info,
      customerId,
      info.userId,
      headers,
    );
    if (!customer) throw new NotFoundException('Customer not found');

    const accounts = await this.accountService.fetchUserAccounts(
      info,
      customer.external_id,
      { limit: 2, offset: 0 },
      headers,
    );
    return { ...customer, accounts };
  }
}

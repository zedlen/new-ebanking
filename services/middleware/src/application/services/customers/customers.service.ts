import { CustomerRepository } from '@middleware/domain/repositories/customer.interface';
import {
  PaginatedResult,
  Pagination,
} from '@middleware/domain/interfaces/pagination.interface';

import { KubitRequest } from '@middleware/infrastructure/providers/kubit-request';
import {
  Injectable,
  Logger,
  PreconditionFailedException,
} from '@nestjs/common';
import { AccountService } from '../accounts/accounts.service';
import { CreateCustomerDTO } from '@middleware/domain/dtos/CreateCustomer.dto';
import { Customer } from '@middleware/domain/entities/customers.entity';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';

import { hideClabe } from '@middleware/domain/utils/hideClabe';
import { Account } from '@middleware/domain/entities/account.entity';

@Injectable()
export class CustomerService {
  private logger = new Logger(CustomerService.name);
  constructor(
    private readonly kubitRequest: KubitRequest,
    private readonly customerRepository: CustomerRepository,
    private readonly accountService: AccountService,
  ) {}

  private async lookupCustomers(
    { appUrl, apiKey, userToken }: HeadersInfo,
    parentId: string,
    level: number,
    headers: Record<string, string>,
  ): Promise<Customer[]> {
    let total = 1000,
      page = 1;
    const customers: Customer[] = [];
    while (total > customers.length) {
      try {
        const customersUrl = `/customers/paged?filter=&limit=100&offset=${page}&${level === 0 ? 'partnerCustomerId' : 'parentId'}=${parentId}`;
        const response = (await this.kubitRequest.getRequest(
          appUrl,
          customersUrl,
          apiKey,
          userToken,
          headers,
        )) as { total: number; data: Customer[] };

        page += 1;
        const { total: currentTotal = 0 } = response;
        total = currentTotal;
        const { data: customersPart = [] } = response as { data: Customer[] };
        if (customersPart.length === 0) return customers;
        customers.push(...customersPart);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error({
          error: errorMessage,
          msg: 'Error while retriving nested accounts',
        });
        return customers;
      }
    }
    return customers;
  }

  async syncCustomer(
    customer: Customer,
    headers: Record<string, string>,
  ): Promise<Customer | null> {
    if (!customer?.id) return null;

    const dbCustomer = await this.customerRepository.findOne({
      external_id: customer.id,
      app: headers['APP_NAME'] ?? '',
    });
    const { id, ...customerData } = customer;
    if (!dbCustomer) {
      return await this.customerRepository.save({
        ...customerData,
        external_id: id,
      });
    }
    await this.customerRepository.update(dbCustomer.id as string, {
      ...customerData,
      external_id: id,
    });
    return await this.customerRepository.get(dbCustomer.id as string);
  }

  async fetchCustomers(
    { appUrl, apiKey, userToken }: HeadersInfo,
    pagination: Pagination,
    parentId: string,
    level: number,
    headers: Record<string, string>,
  ): Promise<PaginatedResult<Customer>> {
    const customers = await this.lookupCustomers(
      { appUrl, apiKey, userToken } as HeadersInfo,
      parentId,
      level,
      headers,
    );
    await Promise.all(
      customers.map((customer) => this.syncCustomer(customer, headers)),
    );
    return this.customerRepository.find(
      {
        ...(level === 0
          ? { account_customer_id: parentId }
          : { parent_id: parentId }),
      },
      pagination,
    );
  }

  async fetchCustomer(
    { appUrl, apiKey, userToken }: HeadersInfo,
    customerId: string,
    headers: Record<string, string>,
  ): Promise<Customer | null> {
    const responseUserInfo = (await this.kubitRequest.getRequest(
      appUrl,
      `/customers/${customerId}`,
      apiKey,
      userToken,
      headers,
    )) as { data: Customer };

    if (!responseUserInfo?.data?.id) return null;
    return this.syncCustomer(responseUserInfo.data, headers);
  }

  async findCustomer(filter: {
    [key: string]: string | number | boolean;
  }): Promise<Customer | null> {
    return this.customerRepository.findOne(filter);
  }

  async findCustomers(filter: {
    [key: string]: string | number | boolean;
  }): Promise<PaginatedResult<Customer>> {
    return this.customerRepository.find(filter);
  }

  async createCustomer(
    { appUrl, apiKey, userToken }: HeadersInfo,
    customerData: CreateCustomerDTO,
    parentId: string,
    headers: Record<string, string>,
  ): Promise<(Customer & { accounts: Account[] }) | null> {
    const responseUserInfo = (await this.kubitRequest.postRequest(
      appUrl,
      `/customers?parentCustomerId=${parentId}`,
      apiKey,
      userToken,
      customerData,
      null,
      headers,
    )) as { data: { customer_id: string } };

    const { data: userData } = responseUserInfo;
    const { customer_id } = userData;
    if (!customer_id)
      throw new PreconditionFailedException(
        'Customer not created correctly on provider',
      );
    const accounts = await this.accountService.createAccount(
      { appUrl, apiKey, userToken } as HeadersInfo,
      customer_id,
      headers,
    );
    const customer = await this.fetchCustomer(
      { appUrl, apiKey, userToken } as HeadersInfo,
      customer_id,
      headers,
    );
    if (!accounts || !customer) {
      throw new PreconditionFailedException(
        'Customer or account not created correctly on provider',
      );
    }
    return {
      ...customer,
      accounts: [accounts].map((account) => hideClabe(account)),
    };
  }

  searchByQuery(query: string) {
    return this.customerRepository.searchByQuery(query);
  }
  searchByQueryWallets(query: string) {
    return this.customerRepository.searchByQueryWallets(query);
  }
}

import { CustomerService } from '@middleware/application/services/customers/customers.service';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { Injectable } from '@nestjs/common';
import { ValidateCustomer } from './validateCustomer.service';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customerService: CustomerService,
    private readonly validate: ValidateCustomer,
  ) {}

  async getCustomerData(info: HeadersInfo, customerId, headers) {
    const customer = await this.validate.validateCustomerOwnership(
      info,
      customerId,
      headers,
    );

    return customer;
  }

  async getCustomers(
    info: HeadersInfo,
    customerId,
    pagination: Pagination,
    headers,
  ) {
    await this.validate.validateCustomerOwnership(info, customerId, headers);
    return this.customerService.fetchCustomers(
      info,
      pagination,
      customerId,
      1,
      headers,
    );
  }
}

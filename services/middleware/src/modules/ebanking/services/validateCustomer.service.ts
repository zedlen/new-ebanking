import { CustomerService } from '@middleware/application/services/customers/customers.service';
import { PartnerService } from '@middleware/application/services/partners/partners.service';
import { Customer } from '@middleware/domain/entities/customers.entity';
import { Partner } from '@middleware/domain/entities/partners.entity';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ValidateCustomer {
  constructor(
    private readonly customerService: CustomerService,
    private readonly partnerService: PartnerService,
  ) {}

  async validateCustomerOwnership(
    info: HeadersInfo,
    customerId: string,
    headers: Record<string, string>,
  ) {
    const { userId } = info;
    let customer: Customer | Partner | null;
    customer = await this.customerService.fetchCustomer(
      info,
      customerId,
      headers,
    );
    if (!customer)
      customer = await this.partnerService.fetchPartner(
        info,
        customerId,
        headers,
      );
    if (!customer) throw new NotFoundException('User not exists');

    if (
      customer.external_id != userId &&
      'parent_id' in customer &&
      customer.parent_id != userId &&
      customer.account_customer_id != userId
    )
      throw new ForbiddenException('Customer is not assigned to user');
    return customer;
  }
}

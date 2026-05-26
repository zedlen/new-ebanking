import { CustomerService } from '@middleware/application/services/customers/customers.service';
import { PartnerService } from '@middleware/application/services/partners/partners.service';
import { Customer } from '@middleware/domain/entities/customers.entity';
import { Partner } from '@middleware/domain/entities/partners.entity';
import {
  PaginatedResult,
  Pagination,
} from '@middleware/domain/interfaces/pagination.interface';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { UserPartnersRepository } from '@middleware/domain/repositories/userPartners.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidateCustomerOwnership {
  constructor(
    private readonly customerService: CustomerService,
    private readonly partnerService: PartnerService,
    private readonly userPartnersRepository: UserPartnersRepository,
  ) {}

  async validate(
    info: HeadersInfo,
    customerId: string,
    userId: string,
    headers: Record<string, string>,
  ): Promise<Customer | Partner | null> {
    const assignedPartners = await this.userPartnersRepository.findOne({
      customerId: userId,
    });
    if (!assignedPartners) return null;
    let customer: Partner | Customer | null;
    customer = await this.partnerService.fetchPartner(
      info,
      customerId,
      headers,
    );
    if (customer) {
      if (
        assignedPartners.allPartners ||
        assignedPartners.asignedPartners.includes(customer?.external_id)
      ) {
        return customer;
      }
    }
    customer = await this.customerService.fetchCustomer(
      info,
      customerId,
      headers,
    );
    if (customer) {
      if (
        assignedPartners.allPartners ||
        assignedPartners.asignedPartners.includes(customer?.account_customer_id)
      ) {
        return customer;
      }
    }
    return null;
  }

  async getAsignedPartners(
    userId: string,
    pagination: Pagination,
  ): Promise<PaginatedResult<Partner>> {
    const assignedPartners = await this.userPartnersRepository.findOne({
      customerId: userId,
    });
    if (!assignedPartners) return { data: [], total: 0 };
    if (assignedPartners.allPartners) {
      return await this.partnerService.findPartners({}, pagination);
    }
    return await this.partnerService.findPartners(
      {
        external_id: assignedPartners.asignedPartners,
      },
      pagination,
    );
  }
}

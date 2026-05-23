import { UserPartnersRepository } from '@middleware/domain/repositories/userPartners.interface';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Customer } from '@middleware/domain/entities/customers.entity';
import { Partner } from '@middleware/domain/entities/partners.entity';
import { PartnerRepository } from '@middleware/domain/repositories/partner.interface';
import { CustomerRepository } from '@middleware/domain/repositories/customer.interface';

@Injectable()
export class UserInfo {
  constructor(
    private readonly userPartnerRepository: UserPartnersRepository,
    private readonly partnerRepository: PartnerRepository,
    private readonly customerRepository: CustomerRepository,
  ) {}

  async getCustomerById(
    customerId: string,
    partnerId: string,
    userId: string,
  ): Promise<Customer | Partner> {
    const partner = await this.partnerRepository.get(partnerId);
    const userAssigned = await this.userPartnerRepository.findOne({
      customerId: userId,
    });
    if (!userAssigned)
      throw new UnprocessableEntityException('Not partners assigned');
    if (!partner) throw new NotFoundException(`PartnerID is wrong`);
    if (
      !userAssigned.allPartners &&
      !userAssigned.asignedPartners.includes(partnerId)
    )
      throw new ForbiddenException();
    if (customerId === partnerId) return partner;
    const customer = await this.customerRepository.findOne({
      id: customerId,
      account_customer_id: partner.external_id,
    });

    if (!customer) throw new NotFoundException(`CustomerID is wrong`);
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | Partner | null> {
    const partner = await this.partnerRepository.findOne({
      contact_email: email,
    });
    if (partner) return partner;
    const customer = await this.customerRepository.findOne({
      contact_email: email,
    });

    return customer;
  }

  async getCustomerEmail(customerId: string): Promise<string | null> {
    const partner = await this.partnerRepository.findOne({
      external_id: customerId,
    });
    if (partner) return partner.contact_email;
    const customer = await this.customerRepository.findOne({
      external_id: customerId,
    });

    return customer?.contact_email ?? null;
  }

  async getCustomerByIdNoValidation(
    customerId: string,
  ): Promise<Customer | Partner | null> {
    const partner = await this.partnerRepository.findOne({
      external_id: customerId,
    });
    if (partner) return partner;

    const customer = await this.customerRepository.findOne({
      external_id: customerId,
    });

    return customer;
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Customer } from '@middleware/domain/entities/customers.entity';
import { Partner } from '@middleware/domain/entities/partners.entity';
import { CustomerRepository } from '@middleware/domain/repositories/customer.interface';
import { PartnerRepository } from '@middleware/domain/repositories/partner.interface';
import { UserPartnersRepository } from '@middleware/domain/repositories/userPartners.interface';
import { PartnerService } from '../services/partners/partners.service';
import { CustomerService } from '../services/customers/customers.service';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';

export type UserContext = Customer | Partner;

/**
 * Resolves customer or partner for a scoped user (backoffice / reports).
 */
@Injectable()
export class ResolveUserContextService {
  constructor(
    private readonly userPartnerRepository: UserPartnersRepository,
    private readonly partnerRepository: PartnerRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly partnerService: PartnerService,
    private readonly customerService: CustomerService,
  ) {}

  async byCustomerId(
    customerId: string,
    partnerId: string,
    userId: string,
  ): Promise<UserContext> {
    const partner = await this.partnerRepository.get(partnerId);
    const userAssigned = await this.userPartnerRepository.findOne({
      customerId: userId,
    });
    if (!userAssigned)
      throw new UnprocessableEntityException('Not partners assigned');
    if (!partner) throw new NotFoundException('PartnerID is wrong');
    if (
      !userAssigned.allPartners &&
      !userAssigned.asignedPartners?.includes(partnerId)
    ) {
      throw new ForbiddenException();
    }
    if (customerId === partnerId) return partner;
    const customer = await this.customerRepository.findOne({
      id: customerId,
      account_customer_id: partner.external_id,
    });
    if (!customer) throw new NotFoundException('CustomerID is wrong');
    return customer;
  }

  /** Try customer external id, then partner — used by ebanking flows. */
  async byExternalIdNoValidation(
    customerId: string,
  ): Promise<UserContext | null> {
    const partner = await this.partnerRepository.findOne({
      external_id: customerId,
    });
    if (partner) return partner;
    return this.customerRepository.findOne({ external_id: customerId });
  }

  async byExternalIdNoValidationRequest(
    info: HeadersInfo,
    customerId: string,
    headers: Record<string, string>,
  ): Promise<UserContext | null> {
    const partner = await this.partnerService.fetchPartner(
      info,
      customerId,
      headers,
    );
    if (partner) return partner;
    return this.customerService.fetchCustomer(info, customerId, headers);
  }
}

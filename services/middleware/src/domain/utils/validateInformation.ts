import { Injectable } from '@nestjs/common';
import { Customer } from '../entities/customers.entity';
import { Partner } from '../entities/partners.entity';
import { PartnerRepository } from '../repositories/partner.interface';
import { CustomerRepository } from '../repositories/customer.interface';
import { z } from 'zod';
import { AffiliationRequestRepository } from '../repositories/affiliationRequest.interface';

@Injectable()
export class ValidateInformation {
  constructor(
    private readonly partnerRepository: PartnerRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly affiliationRepository: AffiliationRequestRepository,
  ) {}
  async validateAffiliationCode(
    affiliationCode: string,
  ): Promise<{ isValid: boolean; code: string }> {
    if (!affiliationCode.match(/[A-Z0-9]{3,15}$/))
      return { isValid: false, code: 'invalid_code_format' };
    const customer = await this.customerRepository.findOne({
      affiliation_code: affiliationCode,
    });
    if (customer) return { isValid: false, code: 'code_already_in_use' };

    const partner = await this.partnerRepository.findOne({
      affiliation_code: affiliationCode,
    });
    if (partner) return { isValid: false, code: 'code_already_in_use' };
    return { isValid: true, code: '' };
  }

  async getByAffiliationCode(
    affiliationCode: string,
  ): Promise<Customer | Partner | null> {
    const customer = await this.customerRepository.findOne({
      affiliation_code: affiliationCode,
    });
    if (customer) return customer;

    const partner = await this.partnerRepository.findOne({
      affiliation_code: affiliationCode,
    });
    if (partner) return partner;
    return null;
  }

  async validateEmail(
    email: string,
    app: string = 'livingrock',
  ): Promise<{ isValid: boolean; code: string }> {
    const emailValidation = z.email();
    const validEmail = emailValidation.safeParse(email);
    if (!validEmail.success)
      return { isValid: false, code: validEmail.error.message };
    // Xecora do not validate email
    if (app === 'xecora') return { isValid: true, code: '' };

    const customer = await this.customerRepository.findOne({
      contact_email: email,
      app: app,
    });
    if (customer) return { isValid: false, code: 'email_already_in_use' };

    const partner = await this.partnerRepository.findOne({
      contact_email: email,
    });
    if (partner) return { isValid: false, code: 'email_already_in_use' };

    const affiliation = await this.affiliationRepository.findOne({
      contact_email: email,
    });
    if (affiliation) return { isValid: false, code: 'email_already_in_use' };
    return { isValid: true, code: '' };
  }
}

import { CustomerService } from '@middleware/application/services/customers/customers.service';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  PreconditionFailedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ValidateCustomer } from './validateCustomer.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AffiliationRequestService } from '@middleware/application/services/affiliationRequests/affiliationRequests.service';
import { AffiliationRequestDTO } from '@middleware/domain/dtos/AffiliationRequest.dto';
import { CreateCustomerDTO } from '@middleware/domain/dtos/CreateCustomer.dto';
import { AccountService } from '@middleware/application/services/accounts/accounts.service';

@Injectable()
export class AffiliationService {
  private readonly logger = new Logger(AffiliationService.name);
  constructor(
    private readonly customerService: CustomerService,
    private readonly validate: ValidateCustomer,
    @InjectQueue('sync-customers') private readonly syncCustomers: Queue,
    private readonly affiliations: AffiliationRequestService,
    private readonly accountService: AccountService,
  ) {}

  getUserAffiliations(
    info: HeadersInfo,
    pagination: Pagination,
    headers: Record<string, string>,
    query?: string,
  ) {
    return this.customerService.fetchUserAffiliations(
      info,
      info.userId,
      pagination,
      headers,
      query,
    );
  }

  async syncAffiliations(info: HeadersInfo, headers: Record<string, string>) {
    const customer = await this.validate.validateCustomerOwnership(
      info,
      info.userId,
      headers,
    );

    const body = {
      headersInfo: info,
      headers,
      info,
      parentId: customer.external_id,
      isPartner: false,
    };

    // for partners
    if ('economic_activity' in customer) {
      body.isPartner = true;
    }
    console.log(body);
    const result = await this.syncCustomers.add(
      `sync-customer-${customer.external_id}`,
      body,
      {
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
    console.log(result);
  }

  getAffiliationRequests(info: HeadersInfo, pagination: Pagination) {
    return this.affiliations.getCustomerAffiliationsRequest(
      info.userId,
      info.appName,
      pagination,
    );
  }

  async approveAffiliationRequest(
    { appUrl, apiKey, userToken, userId, appName }: HeadersInfo,
    affiliationId: string,
    headers: Record<string, string>,
  ) {
    const affiliation = await this.affiliations.findOne({
      parent_id: userId,
      id: affiliationId,
      app: appName,
    });
    if (!affiliation)
      throw new NotFoundException('Affiliation is not avialabe');
    const customerData: CreateCustomerDTO = {
      ...affiliation,
    };
    const customer = await this.customerService.createCustomer(
      { appUrl, apiKey, userToken, userId } as HeadersInfo,
      customerData,
      userId,
      headers,
    );
    if (!customer)
      throw new PreconditionFailedException('Error while creating customer');
    await this.affiliations.updateCustomerAffiliationsRequest(affiliationId, {
      status: 'approved',
    });
    const accounts = await this.accountService.createAccount(
      { appUrl, apiKey, userToken, userId } as HeadersInfo,
      customer.external_id,
      headers,
    );
    return { ...customer, accounts };
  }

  async editAffiliation(
    { userId }: HeadersInfo,
    id: string,
    data: AffiliationRequestDTO,
  ) {
    const affiliation = await this.affiliations.findOne({
      parent_id: userId,
      id: id,
      app: data.app,
    });
    if (!affiliation)
      throw new NotFoundException('Affiliation is not avialabe');
    if (affiliation.status !== 'pending')
      throw new UnprocessableEntityException(
        'Affiliation has already been processed',
      );
    const { affiliation_code, isEnterprise, ...request } = data;
    this.logger.verbose({ affiliation_code, isEnterprise });
    return this.affiliations.updateCustomerAffiliationsRequest(id, request);
  }

  async rejectAffiliationRequest(
    { userId, appName }: HeadersInfo,
    affiliationId: string,
  ) {
    const affiliation = await this.affiliations.findOne({
      parent_id: userId,
      id: affiliationId,
      app: appName,
    });
    if (!affiliation)
      throw new NotFoundException('Affiliation is not avialabe');
    if (affiliation.status !== 'pending')
      throw new UnprocessableEntityException(
        'Affiliation has already been processed',
      );
    return this.affiliations.updateCustomerAffiliationsRequest(affiliationId, {
      status: 'rejected',
    });
  }

  async createAffiliationRequest(appName: string, data: AffiliationRequestDTO) {
    if (!data.affiliation_code)
      throw new BadRequestException('Affiliation code is required');
    const customer = await this.validate.getCustomerByAffiliationCode(
      data.affiliation_code,
      { appName } as HeadersInfo,
    );
    if (!customer) throw new BadRequestException('Affiliation code is wrong');
    return this.affiliations.createCustomerAffiliationsRequest({
      name: data.name,
      ap_paterno: data.ap_paterno,
      ap_materno: data.ap_materno,
      contact_name: `${data.name} ${data.ap_paterno} ${data.ap_materno}`,
      contact_email: (data?.contact_email || '').trim().toLowerCase(),
      contact_tel: (data?.contact_tel || '')
        .replace(/ /g, '')
        .replace(/-/g, ''),
      parent_id: customer.external_id,
      company_name: '',
      taxpayer_type_id: 1,
      status: 'pending',
      app: appName,
      active: true,
      rfc: data.rfc || 'XOXO010101XX0',
      address: data.isEnterprise
        ? customer.address
        : data.address || customer.address,
    });
  }

  async validateAffiliationCode(appName: string, affiliationCode: string) {
    const customer = await this.validate.getCustomerByAffiliationCode(
      affiliationCode,
      { appName } as HeadersInfo,
    );
    if (!customer) return { valid: false };
    return { valid: true };
  }
}

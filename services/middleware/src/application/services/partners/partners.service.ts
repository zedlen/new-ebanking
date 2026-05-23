import {
  PaginatedResult,
  Pagination,
} from '@middleware/domain/interfaces/pagination.interface';
import { PartnerRepository } from '@middleware/domain/repositories/partner.interface';
import { UserPartnersRepository } from '@middleware/domain/repositories/userPartners.interface';
import { KubitRequest } from '@middleware/infrastructure/providers/kubit-request';
import {
  Injectable,
  Logger,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { FeatureFlagService } from '../feature-flag/featureFlag.service';
import { CreatePartnerDTO } from '@middleware/domain/dtos/CreatePartner.dto';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { Partner } from '@middleware/domain/entities/partners.entity';

@Injectable()
export class PartnerService {
  private logger = new Logger(PartnerService.name);
  constructor(
    private readonly kubitRequest: KubitRequest,
    private readonly partnerRepository: PartnerRepository,
    private readonly userPartnerRepository: UserPartnersRepository,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  private async lookupPartners(
    { appUrl, apiKey, userToken }: HeadersInfo,
    headers: Record<string, string>,
  ): Promise<Partner[]> {
    let total = 1000,
      page = 1;
    const partners: Partner[] = [];
    while (total > partners.length) {
      try {
        const partnersUrl = `/partners/paged?filter=&limit=100&offset=${page}`;
        const response = (await this.kubitRequest.getRequest(
          appUrl,
          partnersUrl,
          apiKey,
          userToken,
          headers,
        )) as { total: number; data: Partner[] };

        page += 1;
        const { total: currentTotal = 0 } = response;
        total = currentTotal;
        const { data: partnersPart = [] } = response as { data: Partner[] };
        if (partnersPart.length === 0) return partners;
        partners.push(...partnersPart);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error({
          error: errorMessage,
          msg: 'Error while retriving nested accounts',
        });
        return partners;
      }
    }
    return partners;
  }

  async syncPartner(
    partner: Partner,
    headers: Record<string, string>,
  ): Promise<Partner | null> {
    if (!partner?.id) return null;

    const dbPartner = await this.partnerRepository.findOne({
      external_id: partner.id,
      app: headers['APP_NAME'] ?? '',
    });
    const { id, ...partnerData } = partner;
    if (!dbPartner) {
      return await this.partnerRepository.save({
        ...partnerData,
        external_id: id,
        app: headers['APP_NAME'] ?? '',
      });
    }
    await this.partnerRepository.update(dbPartner.id as string, {
      ...partnerData,
      external_id: id,
    });
    return await this.partnerRepository.get(dbPartner.id as string);
  }

  async fetchPartners(
    { appUrl, apiKey, userToken }: HeadersInfo,
    pagination: Pagination,
    headers: Record<string, string>,
  ): Promise<PaginatedResult<Partner>> {
    const partners = await this.lookupPartners(
      { appUrl, apiKey, userToken } as HeadersInfo,
      headers,
    );
    await Promise.all(
      partners.map((partner) => this.syncPartner(partner, headers)),
    );
    return this.partnerRepository.find({}, pagination);
  }

  async fetchPartner(
    { appUrl, apiKey, userToken }: HeadersInfo,
    partnerId: string,
    headers: Record<string, string>,
  ): Promise<Partner | null> {
    const responseUserInfo = (await this.kubitRequest.getRequest(
      appUrl,
      `/partners/${partnerId}`,
      apiKey,
      userToken,
      headers,
    )) as { data: Partner };
    if (!responseUserInfo?.data?.id) return null;
    return this.syncPartner(responseUserInfo.data, headers);
  }

  async findPartner(filter: {
    [key: string]: string | number | boolean;
  }): Promise<Partner | null> {
    return this.partnerRepository.findOne(filter);
  }

  async findPartners(filter: {
    [key: string]: string | number | boolean;
  }): Promise<PaginatedResult<Partner>> {
    return this.partnerRepository.find(filter);
  }

  async createPartner(
    { appUrl, apiKey, userToken }: HeadersInfo,
    partnerData: CreatePartnerDTO,
    headers: Record<string, string>,
  ): Promise<Partner | null> {
    const responseUserInfo = (await this.kubitRequest.postRequest(
      appUrl,
      `/partners`,
      apiKey,
      userToken,
      partnerData,
      null,
      headers,
    )) as { data: { customer_id: string } };

    const { data: userData } = responseUserInfo;
    const { customer_id } = userData;
    if (!customer_id)
      throw new PreconditionFailedException(
        'Partner not created correctly on provider',
      );
    return this.fetchPartner(
      { appUrl, apiKey, userToken } as HeadersInfo,
      customer_id,
      headers,
    );
  }

  async updatePartnerStatus(
    { appUrl, apiKey, userToken }: HeadersInfo,
    partnerId: string,
    status: string,
    headers: Record<string, string>,
  ): Promise<Partner | null> {
    const dbPartner = await this.partnerRepository.findOne({
      external_id: partnerId,
      app: headers['APP_NAME'] ?? '',
    });
    if (!dbPartner) throw new NotFoundException('Partner not found');
    const dbId = dbPartner.id as string;
    await this.kubitRequest.putRequest(
      appUrl,
      `/partners/${partnerId}/status/${status}`,
      apiKey,
      userToken,
      {},
      headers,
    );

    const date =
      status == '2'
        ? { review_date: new Date().toISOString() }
        : { process_date: new Date().toISOString() };

    await this.partnerRepository.update(dbId, {
      status: status,
      ...date,
    });
    return await this.partnerRepository.get(dbId);
  }

  searchByQuery(query: string) {
    return this.partnerRepository.searchByQuery(query);
  }
}

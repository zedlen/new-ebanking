import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PartnerService } from '@middleware/application/services/partners/partners.service';
import { AccountService } from '@middleware/application/services/accounts/accounts.service';
import { MovementService } from '@middleware/application/services/movements/movements.service';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { sleep } from '@middleware/domain/utils/sleep';
import { Account } from '@middleware/domain/entities/account.entity';

@Processor('sync-partners', {
  concurrency: 1,
})
export class SyncPartnersQueue extends WorkerHost {
  private readonly logger = new Logger(SyncPartnersQueue.name);
  constructor(
    private readonly partnerService: PartnerService,
    private readonly accountsService: AccountService,
    private readonly movementService: MovementService,
    @InjectQueue('sync-customers') private readonly syncCustomers: Queue,
  ) {
    super();
  }
  async process(
    job: Job<{ headers: Record<string, string>; headersInfo: HeadersInfo }>,
  ) {
    const { headers, headersInfo } = job.data;
    const { appUrl, apiKey, userToken, appName } = headersInfo;
    this.logger.log(`Starting sync-partners job for app ${appName}`);
    const { data: partners } = await this.partnerService.fetchPartners(
      { appUrl, apiKey, userToken } as HeadersInfo,
      { limit: 100, offset: 0 },
      {
        APP_NAME: appName,
        ...headers,
      },
    );
    let accounts: Array<Account> = [];
    for (const partner of partners) {
      await sleep(1000); // para evitar saturar la API, ajusta según sea necesario
      /*try {
        await this.accountsService.syncPartnerVault(
          { appUrl, apiKey, userToken },
          partner.external_id,
          headers,
        );
      } catch (error) {
        this.logger.error(
          `Error syncing vault for partner ${partner.external_id}: ${typeof error === 'object' && 'message' in error && error.message}`,
        );
      }*/

      try {
        const { data } = await this.accountsService.fetchUserAccounts(
          { appUrl, apiKey, userToken } as HeadersInfo,
          partner.external_id,
          { offset: 0, limit: 10 },
          headers,
        );
        accounts = data;
      } catch (error) {
        this.logger.error(
          `Error syncing accounts for partner ${partner.id}: ${error.message}`,
        );
      }
      try {
        await this.accountsService.fetchAccountFavorites(
          { appUrl, apiKey, userToken } as HeadersInfo,
          partner.external_id,
          headers,
        );
      } catch (error) {
        this.logger.error(
          `Error syncing account favorites for partner ${partner.id}: ${error.message}`,
        );
      }

      this.logger.log(
        `Queued sync-customers job for partner ${partner.external_id}`,
      );
      await this.syncCustomers.add(
        'sync-customers',
        {
          headers,
          headersInfo,
          parentId: partner.external_id,
          isPartner: true,
        },
        { removeOnComplete: true, removeOnFail: true },
      );
    }
    for (const account of accounts) {
      try {
        await this.movementService.fetchAccountMovements(
          { appUrl, apiKey, userToken } as HeadersInfo,
          account.external_id,
          headers,
        );
      } catch (error) {
        this.logger.error(
          `Error syncing movements for account ${account.id}: ${error.message}`,
        );
      }
    }
    this.logger.log(`Completed sync-partners job for app ${appName}`);
  }
}

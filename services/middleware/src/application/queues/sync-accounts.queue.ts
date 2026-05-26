import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AccountService } from '@middleware/application/services/accounts/accounts.service';
import { MovementService } from '@middleware/application/services/movements/movements.service';
import { CardsService } from '@middleware/application/services/cards/cards.service';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { Account } from '@middleware/domain/entities/account.entity';

@Processor('sync-accounts', {
  concurrency: 1,
})
export class SyncAccountsQueue extends WorkerHost {
  private readonly logger = new Logger(SyncAccountsQueue.name);
  constructor(
    private readonly accountsService: AccountService,
    private readonly movementService: MovementService,
    private readonly cardService: CardsService,
  ) {
    super();
  }
  async process(
    job: Job<{
      headers: Record<string, string>;
      customerExternalId: string;
      headersInfo: HeadersInfo;
    }>,
  ) {
    const { headers, headersInfo, customerExternalId } = job.data;
    const { appName } = headersInfo;
    this.logger.log(
      `Starting sync-accounts job for parentId ${customerExternalId} in app ${appName}`,
    );
    let accounts: Array<Account> = [];
    try {
      const { data } = await this.accountsService.fetchUserAccounts(
        headersInfo,
        customerExternalId,
        { offset: 0, limit: 10 },
        headers,
      );
      accounts = data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error syncing accounts for customer ${customerExternalId}: ${errorMessage}`,
      );
    }
    try {
      await this.accountsService.fetchAccountFavorites(
        headersInfo,
        customerExternalId,
        headers,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error syncing account favorites for customer ${customerExternalId}: ${errorMessage}`,
      );
    }
    for (const account of accounts) {
      try {
        await this.cardService.fetchAccountCards(
          headersInfo,
          account.external_id,
          headers,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Error syncing cards for account ${account.external_id}/${account.id}: ${errorMessage}`,
        );
      }
      try {
        await this.movementService.fetchAccountMovements(
          headersInfo,
          account.external_id,
          headers,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Error syncing movements for account ${account.external_id}/${account.id}: ${errorMessage}`,
        );
      }
    }
    this.logger.log(
      `Completed sync-accounts job for customer ${customerExternalId} in app ${appName}`,
    );
  }

  @OnWorkerEvent('failed')
  onJobFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed with error: ${error.message}`);
    // Perform external logging (e.g., Sentry) or notifications
  }
}

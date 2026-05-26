import {
  InjectQueue,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { CustomerService } from '@middleware/application/services/customers/customers.service';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { Customer } from '@middleware/domain/entities/customers.entity';

@Processor('sync-customers', {
  concurrency: 1,
})
export class SyncCustomersQueue extends WorkerHost {
  private readonly logger = new Logger(SyncCustomersQueue.name);
  constructor(
    private readonly customerService: CustomerService,
    @InjectQueue('sync-customers') private readonly syncCustomers: Queue,
    @InjectQueue('sync-accounts') private readonly syncAccounts: Queue,
  ) {
    super();
  }
  async process(
    job: Job<{
      headers: Record<string, string>;
      parentId: string;
      headersInfo: HeadersInfo;
      isPartner: boolean;
    }>,
  ) {
    const { headers, headersInfo, parentId, isPartner } = job.data;
    const { appUrl, apiKey, userToken, appName } = headersInfo;
    let customers: Array<Customer> = [];
    this.logger.log(
      `Starting sync-customers job for parentId ${parentId} in app ${appName}, isPartner: ${isPartner}`,
    );
    try {
      if (isPartner) {
        const { data: customersPart } =
          await this.customerService.fetchCustomers(
            { appUrl, apiKey, userToken } as HeadersInfo,
            { limit: 10000, offset: 0 },
            parentId,
            0,
            headers,
          );
        customers = customersPart;
      }
      if (!isPartner) {
        const { data: customersPart } =
          await this.customerService.fetchCustomers(
            { appUrl, apiKey, userToken } as HeadersInfo,
            { limit: 10000, offset: 0 },
            parentId,
            1,
            headers,
          );
        customers = customersPart;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error syncing customers for parentId ${parentId}: ${errorMessage}`,
      );
    }
    for (const customer of customers) {
      this.syncAccounts.add(
        'sync-accounts',
        {
          headers,
          headersInfo,
          customerExternalId: customer.external_id,
        },
        { removeOnComplete: true, removeOnFail: true },
      );
      if (customer.taxpayer_type_id === 2) {
        this.logger.log(
          `Queued sync-customers job for customer ${customer.external_id} (moral)`,
        );
        //only sync bulk for moral customers
        this.syncCustomers.add(
          'sync-customers',
          {
            headers,
            headersInfo,
            parentId: customer.external_id,
            isPartner: false,
          },
          { removeOnComplete: true, removeOnFail: true },
        );
      }
    }
    this.logger.log(
      `Completed sync-customers job for parentId ${parentId} in app ${appName}`,
    );
  }

  @OnWorkerEvent('failed')
  onJobFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed with error: ${error.message}`);
    // Perform external logging (e.g., Sentry) or notifications
  }
}

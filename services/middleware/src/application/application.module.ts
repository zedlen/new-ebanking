import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import * as https from 'node:https';
import { PersistenceModule } from '@middleware/infrastructure/persistence/persistence.module';
import { KubitRequest } from '@middleware/infrastructure/providers/kubit-request';
import { AccountService } from '@middleware/application/services/accounts/accounts.service';
import { CardsService } from '@middleware/application/services/cards/cards.service';
import { CustomerService } from '@middleware/application/services/customers/customers.service';
import { MovementService } from '@middleware/application/services/movements/movements.service';
import { PartnerService } from '@middleware/application/services/partners/partners.service';
import { FeatureFlagService } from '@middleware/application/services/feature-flag/featureFlag.service';
import { SyncAccountsQueue } from '@middleware/application/queues/sync-accounts.queue';
import { SyncCustomersQueue } from '@middleware/application/queues/sync-customers.queue';
import { SyncPartnersQueue } from '@middleware/application/queues/sync-partners.queue';
import { BrowserDetection } from '@middleware/domain/utils/browserDetection';
import { AssertPartnerAccessService } from './orchestrators/assert-partner-access.service';
import { EnrichAccountsBalanceService } from './orchestrators/enrich-accounts-balance.service';
import { ResolveUserContextService } from './orchestrators/resolve-user-context.service';
import { MailingService } from './services/mailing/mailing.service';
import { KycService } from './services/kyc/kyc.service';
import { KycDiditService } from './services/kyc/didit/kyc.didit.service';
import { KycManualService } from './services/kyc/manual/kyc.manual.service';
import { ReportsService } from './services/reports/reports.service';
import { AppsService } from './services/apps/apps.service';
import { ConfigFieldService } from './services/config-field/configField.service';
import { FilesService } from './services/files/files.service';
import { UserInfo } from '@middleware/domain/utils/getUserInfo';
import { ValidateInformation } from '@middleware/domain/utils/validateInformation';
import { CryptoService } from '@middleware/core/auth/services/crypto.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { AffiliationRequestService } from './services/affiliationRequests/affiliationRequests.service';

@Module({
  imports: [
    PersistenceModule,
    HttpModule.register({
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const sessionMs = parseInt(
          config.get<string>('SESSION_LIFE_TIME') ?? String(3600 * 1000),
          10,
        );
        const jwtExpiresIn =
          config.get<string>('JWT_EXPIRES_IN') ??
          `${Math.floor(sessionMs / 1000)}s`;
        return {
          secret: config.get<string>('JWT_SECRET') ?? 'change-me',
          signOptions: {
            expiresIn: jwtExpiresIn as
              | `${number}s`
              | `${number}h`
              | `${number}d`,
          },
        };
      },
    }),
    BullModule.registerQueue({ name: 'sync-partners' }),
    BullModule.registerQueue({ name: 'sync-customers' }),
    BullModule.registerQueue({ name: 'sync-accounts' }),
    BullModule.registerQueue({ name: 'process-bulk-create-customer' }),
    BullBoardModule.forFeature({
      name: 'sync-partners',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'sync-customers',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'sync-accounts',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'process-bulk-create-customer',
      adapter: BullMQAdapter,
    }),
  ],
  providers: [
    KubitRequest,
    BrowserDetection,
    CryptoService,
    UserInfo,
    ValidateInformation,
    AccountService,
    CardsService,
    CustomerService,
    MovementService,
    PartnerService,
    FeatureFlagService,
    ResolveUserContextService,
    EnrichAccountsBalanceService,
    AssertPartnerAccessService,
    SyncPartnersQueue,
    SyncCustomersQueue,
    SyncAccountsQueue,
    MailingService,
    KycDiditService,
    KycManualService,
    KycService,
    ReportsService,
    AppsService,
    ConfigFieldService,
    FilesService,
    AffiliationRequestService,
  ],
  exports: [
    BrowserDetection,
    UserInfo,
    ValidateInformation,
    KubitRequest,
    AccountService,
    CardsService,
    CustomerService,
    MovementService,
    PartnerService,
    FeatureFlagService,
    ResolveUserContextService,
    EnrichAccountsBalanceService,
    AssertPartnerAccessService,
    SyncPartnersQueue,
    SyncCustomersQueue,
    SyncAccountsQueue,
    MailingService,
    KycDiditService,
    KycManualService,
    KycService,
    ReportsService,
    AppsService,
    ConfigFieldService,
    FilesService,
    JwtModule,
    BullModule,
    AffiliationRequestService,
  ],
})
export class ApplicationModule {}

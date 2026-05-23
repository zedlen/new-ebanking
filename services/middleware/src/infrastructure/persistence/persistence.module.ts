import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITIES } from '@middleware/domain/schemas';
import { AccountRepository } from '@middleware/domain/repositories/account.interface';
import { AffiliationRequestRepository } from '@middleware/domain/repositories/affiliationRequest.interface';
import { AppConfigRepository } from '@middleware/domain/repositories/appConfig.interface';
import { AppConfigFieldRepository } from '@middleware/domain/repositories/appConfigField.interface';
import { AppCredentialsRepository } from '@middleware/domain/repositories/appCredentials.interface';
import { CardRepository } from '@middleware/domain/repositories/card.interface';
import { CardChargeRepository } from '@middleware/domain/repositories/cardCharge.interface';
import { CustomerRepository } from '@middleware/domain/repositories/customer.interface';
import { FavoriteAccountRepository } from '@middleware/domain/repositories/favoriteAccount.interface';
import { FeatureFlagRepository } from '@middleware/domain/repositories/featureFlag.interface';
import { KYCReviewRepository } from '@middleware/domain/repositories/kycReview.interface';
import { MovementRepository } from '@middleware/domain/repositories/movement.interface';
import { OpensessionRepository } from '@middleware/domain/repositories/openSessions.interface';
import { PartnerRepository } from '@middleware/domain/repositories/partner.interface';
import { ProcessDocumentRepository } from '@middleware/domain/repositories/processDocument.interface';
import { UserRepository } from '@middleware/domain/repositories/user.interface';
import { UserAgentRepository } from '@middleware/domain/repositories/userAgent.interface';
import { UserPartnersRepository } from '@middleware/domain/repositories/userPartners.interface';
import { VaultRepository } from '@middleware/domain/repositories/vault.interface';
import { AccountPostgresRepository } from './postgres/account.repository.postgres';
import { AffiliationRequestPostgresRepository } from './postgres/affiliationRequest.repository.postgres';
import { AppConfigPostgresRepository } from './postgres/appConfig.repository.postgres';
import { AppConfigFieldPostgresRepository } from './postgres/appConfigField.repository.postgres';
import { AppCredentialsPostgresRepository } from './postgres/appCredentials.repository.postgres';
import { CardPostgresRepository } from './postgres/card.repository.postgres';
import { CardChargePostgresRepository } from './postgres/cardCharge.repository.postgres';
import { CustomerPostgresRepository } from './postgres/customer.repository.postgres';
import { FavoriteAccountPostgresRepository } from './postgres/favoriteAccount.repository.postgres';
import { FeatureFlagPostgresRepository } from './postgres/featureFlag.repository.postgres';
import { KYCReviewPostgresRepository } from './postgres/kycReview.repository.postgres';
import { MovementPostgresRepository } from './postgres/movement.repository.postgres';
import { OpenSessionPostgresRepository } from './postgres/opensession.repository.postgres';
import { PartnerPostgresRepository } from './postgres/partner.repository.postgres';
import { ProcessDocumentPostgresRepository } from './postgres/processDocument.repository.postgres';
import { UserPostgresRepository } from './postgres/user.repository.postgres';
import { UserAgentPostgresRepository } from './postgres/userAgent.repository.postgres';
import { UserPartnersPostgresRepository } from './postgres/userPartners.repository.postgres';
import { VaultPostgresRepository } from './postgres/vault.repository.postgres';
import { MailTemplateRepository } from '@middleware/domain/repositories/mailTemplate.interface';
import { MailTemplatePostgresRepository } from './postgres/mailTemplate.repository.postgres';

const REPOSITORY_BINDINGS = [
  { provide: OpensessionRepository, useClass: OpenSessionPostgresRepository },
  {
    provide: AppCredentialsRepository,
    useClass: AppCredentialsPostgresRepository,
  },
  { provide: AppConfigRepository, useClass: AppConfigPostgresRepository },
  {
    provide: AppConfigFieldRepository,
    useClass: AppConfigFieldPostgresRepository,
  },
  { provide: AccountRepository, useClass: AccountPostgresRepository },
  { provide: CardRepository, useClass: CardPostgresRepository },
  { provide: CustomerRepository, useClass: CustomerPostgresRepository },
  { provide: MovementRepository, useClass: MovementPostgresRepository },
  { provide: PartnerRepository, useClass: PartnerPostgresRepository },

  { provide: UserPartnersRepository, useClass: UserPartnersPostgresRepository },
  { provide: FeatureFlagRepository, useClass: FeatureFlagPostgresRepository },
  { provide: UserRepository, useClass: UserPostgresRepository },
  { provide: UserAgentRepository, useClass: UserAgentPostgresRepository },
  {
    provide: AffiliationRequestRepository,
    useClass: AffiliationRequestPostgresRepository,
  },
  {
    provide: FavoriteAccountRepository,
    useClass: FavoriteAccountPostgresRepository,
  },
  { provide: KYCReviewRepository, useClass: KYCReviewPostgresRepository },
  {
    provide: ProcessDocumentRepository,
    useClass: ProcessDocumentPostgresRepository,
  },
  { provide: VaultRepository, useClass: VaultPostgresRepository },
  { provide: CardChargeRepository, useClass: CardChargePostgresRepository },
  { provide: MailTemplateRepository, useClass: MailTemplatePostgresRepository },
];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(ENTITIES)],
  providers: [...REPOSITORY_BINDINGS],
  exports: [TypeOrmModule, ...REPOSITORY_BINDINGS],
})
export class PersistenceModule {}

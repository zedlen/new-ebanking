import { AppCredential } from '@middleware/domain/entities/appCredentials.entity';
import { Repository } from './repository.interface';

export abstract class AppCredentialsRepository extends Repository<AppCredential> {}

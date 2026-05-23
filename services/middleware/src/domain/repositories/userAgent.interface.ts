import { UserAgent } from '@middleware/domain/entities/userAgent.entity';
import { Repository } from './repository.interface';

export abstract class UserAgentRepository extends Repository<UserAgent> {}

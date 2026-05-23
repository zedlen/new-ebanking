import { OpenSession } from '@middleware/domain/entities/openSessions.entity';
import { Repository } from './repository.interface';

export abstract class OpensessionRepository extends Repository<OpenSession> {
  abstract deleteUnsetSessions(users: string[]): Promise<boolean>;
}

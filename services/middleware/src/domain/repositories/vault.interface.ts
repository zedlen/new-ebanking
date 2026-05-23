import { Vault } from '@middleware/domain/entities/vault.entity';
import { Repository } from './repository.interface';

export abstract class VaultRepository extends Repository<Vault> {}

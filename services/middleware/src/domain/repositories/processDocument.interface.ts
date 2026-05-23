import { ProcessDocument } from '@middleware/domain/entities/processDocument.entity';
import { Repository } from './repository.interface';

export abstract class ProcessDocumentRepository extends Repository<ProcessDocument> {}

import { Entity } from '@middleware/domain/repositories/entity.interface';
export interface MailTemplate extends Entity {
  id: string;
  template_id: string;
  design: Record<string, unknown>;
}

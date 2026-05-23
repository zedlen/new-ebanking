import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 2: enable with DB_SYNCHRONIZE=true for local dev, or expand this migration
 * with explicit CREATE TABLE statements generated from ENTITIES.
 */
export class InitialSchema1740000000000 implements MigrationInterface {
  name = 'InitialSchema1740000000000';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // TypeORM synchronize handles dev bootstrap when DB_SYNCHRONIZE=true.
    // Production: run `npm run migration:generate` against a live schema snapshot.
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // no-op
  }
}

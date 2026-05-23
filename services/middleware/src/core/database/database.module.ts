import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITIES } from '@middleware/domain/schemas';

@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            const url = config.get<string>('PGDB_URI');
            if (!url) {
              throw new Error(
                'PGDB_URI is required. Copy .env.example to .env.local and set postgres URL.',
              );
            }
            return {
              type: 'postgres' as const,
              url,
              entities: ENTITIES,
              migrations: [`${__dirname}/migrations/*{.ts,.js}`],
              synchronize: config.get('DB_SYNCHRONIZE') === 'true',
              migrationsRun: config.get('RUN_MIGRATIONS') === 'true',
            };
          },
        }),
      ],
    };
  }
}

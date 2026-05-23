import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ENTITIES } from '../../domain/schemas';

export default new DataSource({
  type: 'postgres',
  url: process.env.PGDB_URI,
  entities: ENTITIES,
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

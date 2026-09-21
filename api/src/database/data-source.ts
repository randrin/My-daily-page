import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { entities } from '../entities';
import { postgresUrl } from './postgres-url';

config();

const dataSource = new DataSource({
  type: 'postgres',
  url: postgresUrl(process.env.DATABASE_URL),
  entities,
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

export default dataSource;

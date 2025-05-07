// src/database/ormconfig.ts
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

dotenv.config();
const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASS'),
  database: configService.get('DB_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  ssl: configService.get('DB_SSL') === 'true',
});

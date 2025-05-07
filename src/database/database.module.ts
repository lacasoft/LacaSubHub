import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { types } from 'pg';

types.setTypeParser(types.builtins.NUMERIC, (value: string): number =>
  Number(value),
);
types.setTypeParser(
  (types.builtins as any).TIMESTAMPTZ,
  (value: any): string => value,
);
types.setTypeParser(types.builtins.TIMESTAMP, (value: any): string => value);
types.setTypeParser(types.builtins.DATE, (value: any): string => value);

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        migrationsRun: configService.get('DB_MIGRATIONS') === 'true',
        logging:
          configService.get('APP_PROD') === 'true'
            ? false
            : configService.get('DB_LOGGIN') === 'true',
        entities: [`${__dirname}/../**/*.entity.ts`],
        migrations: [`${__dirname}/../migrations/**/*{.ts,.js}`],
        cli: {
          migrationsDir: './migrations',
        },
        ssl: configService.get('DB_SSL') === 'true',
        autoLoadEntities: configService.get('DB_LOAD_ENTITIES') === 'true',
        synchronize: configService.get('DB_SYNC') === 'true',
      }),
    }),
  ],
})
export class DatabaseModule {}

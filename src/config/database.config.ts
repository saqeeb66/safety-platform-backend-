import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,

  autoLoadEntities: true,

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  synchronize: true,

  ssl: {
    rejectUnauthorized: false,
  },
};

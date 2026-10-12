import { DataSource } from 'typeorm';
import { Organization } from './organizations/entities/organization.entity';
import { EnvironmentConfig } from './organizations/entities/environment-config.entity';
import { User } from './users/entities/user.entity';
import { ApiKey } from './auth/entities/api-key.entity';
import { Wallet } from './billing/entities/wallet.entity';
import { Transaction } from './billing/entities/transaction.entity';
import { VerificationLog } from './verifications/entities/verification-log.entity';
import { SystemConfig } from './admin/entities/system-config.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'verixa',
  password: process.env.DB_PASSWORD || 'verixa_password',
  database: process.env.DB_NAME || 'verixa_db',
  entities: [
    Organization,
    EnvironmentConfig,
    User,
    ApiKey,
    Wallet,
    Transaction,
    VerificationLog,
    SystemConfig,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});

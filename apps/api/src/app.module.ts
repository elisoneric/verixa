import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Organization } from './organizations/entities/organization.entity';
import { EnvironmentConfig } from './organizations/entities/environment-config.entity';
import { User } from './users/entities/user.entity';
import { ApiKey } from './auth/entities/api-key.entity';
import { Wallet } from './billing/entities/wallet.entity';
import { Transaction } from './billing/entities/transaction.entity';
import { VerificationLog } from './verifications/entities/verification-log.entity';
import { SystemConfig } from './admin/entities/system-config.entity';

import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { VerificationsModule } from './verifications/verifications.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { SlipsModule } from './slips/slips.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requests per minute
    }]),
    TypeOrmModule.forRoot({
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
      synchronize: true, // Use only in dev, disable in production
    }),
    NotificationsModule,
    AdminModule,
    AuthModule,
    BillingModule,
    VerificationsModule,
    SlipsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}


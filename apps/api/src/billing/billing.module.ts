import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { PaystackService } from './paystack.service';
import { BillingController } from './billing.controller';
import { Organization } from '../organizations/entities/organization.entity';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { ApiKey } from '../auth/entities/api-key.entity';
import { EnvironmentConfig } from '../organizations/entities/environment-config.entity';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wallet, 
      Transaction, 
      Organization, 
      SystemConfig, 
      ApiKey, 
      EnvironmentConfig
    ])
  ],
  controllers: [BillingController],
  providers: [BillingService, PaystackService, DualAuthGuard],
  exports: [BillingService, PaystackService, DualAuthGuard],
})
export class BillingModule {}

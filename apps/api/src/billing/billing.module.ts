import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { PaystackService } from './paystack.service';
import { BillingController } from './billing.controller';

import { Organization } from '../organizations/entities/organization.entity';
import { SystemConfig } from '../admin/entities/system-config.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction, Organization, SystemConfig])],
  controllers: [BillingController],
  providers: [BillingService, PaystackService],
  exports: [BillingService, PaystackService],
})
export class BillingModule {}

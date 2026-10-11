import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController, PricingController } from './admin.controller';
import { SystemConfig } from './entities/system-config.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Transaction } from '../billing/entities/transaction.entity';
import { VerificationLog } from '../verifications/entities/verification-log.entity';
import { Wallet } from '../billing/entities/wallet.entity';
import { User } from '../users/entities/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemConfig, 
      Organization, 
      Transaction, 
      VerificationLog,
      Wallet,
      User,
    ])
  ],
  controllers: [AdminController, PricingController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

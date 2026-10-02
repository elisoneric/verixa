import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationLog } from '../verifications/entities/verification-log.entity';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { NinSlipService } from './nin-slip.service';
import { NinSlipController } from './nin-slip.controller';
import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { VerificationsModule } from '../verifications/verifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationLog, SystemConfig]),
    AuthModule,
    BillingModule,
    VerificationsModule,
  ],
  controllers: [NinSlipController],
  providers: [NinSlipService],
  exports: [NinSlipService],
})
export class SlipsModule {}

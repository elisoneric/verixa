import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationLog } from '../verifications/entities/verification-log.entity';
import { NinSlipService } from './nin-slip.service';
import { NinSlipController } from './nin-slip.controller';
import { DojahProvider } from '../verifications/providers/dojah.provider';
import { MockProvider } from '../verifications/providers/mock.provider';
import { IdentityCacheService } from '../verifications/identity-cache.service';
import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationLog]),
    AuthModule,
    BillingModule,
  ],
  controllers: [NinSlipController],
  providers: [NinSlipService, DojahProvider, MockProvider, IdentityCacheService],
  exports: [NinSlipService, DojahProvider],
})
export class SlipsModule {}

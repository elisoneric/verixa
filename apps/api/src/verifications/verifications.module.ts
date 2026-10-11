import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationLog } from './entities/verification-log.entity';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { Wallet } from '../billing/entities/wallet.entity';
import { VerificationsController } from './verifications.controller';
import { ApiController } from './api.controller';
import { MockProvider } from './providers/mock.provider';
import { DojahProvider } from './providers/dojah.provider';
import { IdentityCacheService } from './identity-cache.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationLog, SystemConfig, Wallet]),
    AuthModule,
  ],
  controllers: [VerificationsController, ApiController],
  providers: [MockProvider, DojahProvider, IdentityCacheService],
  exports: [IdentityCacheService, MockProvider, DojahProvider],
})
export class VerificationsModule {}

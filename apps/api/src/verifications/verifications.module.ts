import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationLog } from './entities/verification-log.entity';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { VerificationsController } from './verifications.controller';
import { MockProvider } from './providers/mock.provider';
import { DojahProvider } from './providers/dojah.provider';
import { IdentityCacheService } from './identity-cache.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationLog, SystemConfig]),
    AuthModule,
  ],
  controllers: [VerificationsController],
  providers: [MockProvider, DojahProvider, IdentityCacheService],
  exports: [IdentityCacheService, MockProvider, DojahProvider],
})
export class VerificationsModule {}

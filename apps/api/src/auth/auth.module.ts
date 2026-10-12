import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ApiKey } from './entities/api-key.entity';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Wallet } from '../billing/entities/wallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey, User, Organization, Wallet]),
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret && process.env.NODE_ENV === 'production') {
          throw new Error('FATAL: JWT_SECRET environment variable is missing in production');
        }
        return {
          secret: secret || 'verixa_super_secret_dev_only',
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
  ],
  providers: [ApiKeyGuard, AuthService],
  controllers: [AuthController],
  exports: [ApiKeyGuard, AuthService, TypeOrmModule],
})
export class AuthModule {}

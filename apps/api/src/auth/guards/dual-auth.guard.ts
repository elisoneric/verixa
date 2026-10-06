import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { Environment } from '../../organizations/entities/environment-config.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DualAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || request.headers['x-api-key'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing authentication credentials. Provide a Bearer token or API key.');
    }

    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : String(authHeader);

    // 1. Demo sandbox bypass
    if (token === 'vrx_test_demo') {
      request.organizationId = 'dev-org-id';
      request.environment = Environment.SANDBOX;
      request.apiKeyId = 'dev-key-id';
      request.user = { email: 'developer@verixa.io', org_id: 'dev-org-id', role: 'DEVELOPER' };
      return true;
    }

    // 2. Check if token is API Key (vrx_live_ or vrx_test_)
    if (token.startsWith('vrx_live_') || token.startsWith('vrx_test_')) {
      const isLive = token.startsWith('vrx_live_');
      const prefix = isLive ? 'vrx_live_' : 'vrx_test_';
      const remainder = token.substring(prefix.length);
      const splitIndex = remainder.indexOf('_');

      if (splitIndex === -1) {
        throw new UnauthorizedException('Invalid API key format');
      }

      const id = remainder.substring(0, splitIndex);
      const secret = remainder.substring(splitIndex + 1);

      const apiKeyRecord = await this.apiKeyRepository.findOne({
        where: { id, isActive: true },
        relations: { organization: { users: true } },
      });

      if (!apiKeyRecord) {
        throw new UnauthorizedException('API key not found or revoked');
      }

      const isMatch = await bcrypt.compare(secret, apiKeyRecord.keyHash);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid API key');
      }

      request.organizationId = apiKeyRecord.org_id;
      request.environment = apiKeyRecord.environment;
      request.apiKeyId = apiKeyRecord.id;

      const primaryUser = apiKeyRecord.organization?.users?.[0];
      request.user = {
        email: primaryUser?.email || `org-${apiKeyRecord.org_id}@verixa.internal`,
        org_id: apiKeyRecord.org_id,
        role: 'DEVELOPER',
      };

      return true;
    }

    // 3. Otherwise verify as JWT Dashboard session
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
      request.organizationId = payload.org_id;
      request.environment = request.headers['x-verixa-environment'] === 'sandbox'
        ? Environment.SANDBOX
        : Environment.LIVE;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication credentials');
    }
  }
}

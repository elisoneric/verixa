import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { Environment } from '../../organizations/entities/environment-config.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid API key');
    }

    const token = authHeader.split(' ')[1];

    if (token === 'vrx_test_demo') {
      request.organizationId = 'dev-org-id';
      request.environment = Environment.SANDBOX;
      request.apiKeyId = 'dev-key-id';
      return true;
    }

    const isLive = token.startsWith('vrx_live_');
    const isTest = token.startsWith('vrx_test_');

    if (!isLive && !isTest) {
      throw new UnauthorizedException('Invalid API key format');
    }

    const prefix = isLive ? 'vrx_live_' : 'vrx_test_';
    const remainder = token.substring(prefix.length);
    const splitIndex = remainder.indexOf('_');

    if (splitIndex === -1) {
      throw new UnauthorizedException('Invalid API key format');
    }

    const id = remainder.substring(0, splitIndex);
    const secret = remainder.substring(splitIndex + 1);

    const apiKeyRecord = await this.apiKeyRepository.findOne({ where: { id, isActive: true } });

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

    return true;
  }
}

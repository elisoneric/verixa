import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { Environment } from '../../organizations/entities/environment-config.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    @Optional()
    private jwtService?: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rawApiKey = (
      request.headers['x-api-key'] ||
      request.headers['x-api-token'] ||
      request.headers['api-key'] ||
      request.headers.authorization ||
      ''
    ).trim();

    // App ID is completely optional
    const appIdHeader = request.headers.appid || request.headers['app-id'] || request.headers['x-app-id'];
    if (appIdHeader) {
      request.appId = Array.isArray(appIdHeader) ? appIdHeader[0] : appIdHeader;
    }

    if (!rawApiKey) {
      throw new UnauthorizedException('Missing API key. Please provide your API key in the X-Api-Key or Authorization header.');
    }

    const token = rawApiKey.startsWith('Bearer ')
      ? rawApiKey.slice(7).trim()
      : rawApiKey;

    if (token === 'vrx_test_demo') {
      if (process.env.NODE_ENV === 'production') {
        throw new UnauthorizedException('Demo key is disabled in production environment');
      }
      request.organizationId = 'dev-org-id';
      request.environment = Environment.SANDBOX;
      request.apiKeyId = 'dev-key-id';
      return true;
    }

    const isLive = token.startsWith('vrx_live_');
    const isTest = token.startsWith('vrx_test_');

    if (!isLive && !isTest) {
      // Check if it's a valid dashboard JWT session
      if (this.jwtService) {
        try {
          const payload = await this.jwtService.verifyAsync(token);
          request.user = payload;
          request.organizationId = payload.org_id;
          request.environment = payload.environment || Environment.SANDBOX;
          request.apiKeyId = 'session_token';
          return true;
        } catch {
          // fall through to invalid format exception
        }
      }
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

    const apiKeyRecord = await this.apiKeyRepository.findOne({
      where: { id, isActive: true },
      relations: { organization: true },
    });

    if (!apiKeyRecord) {
      throw new UnauthorizedException('API key not found or revoked');
    }

    // GUARD-3: Enforce organization suspension
    if (apiKeyRecord.organization?.complianceData?.status === 'suspended') {
      throw new ForbiddenException('Organization account is suspended. Please contact support.');
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

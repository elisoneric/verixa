import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Wallet } from '../billing/entities/wallet.entity';
import { EnvironmentConfig, Environment } from '../organizations/entities/environment-config.entity';
import { ApiKey } from './entities/api-key.entity';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PaystackService } from '../billing/paystack.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    private jwtService: JwtService,
    private dataSource: DataSource,
    private paystackService: PaystackService,
    private notificationsService: NotificationsService,
  ) {}

  async register(
    email: string,
    password: string,
    orgName: string,
    complianceData?: any
  ) {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let orgId: string;
    let userId: string;

    try {
      const org = new Organization();
      org.name = orgName;
      if (complianceData) {
        org.complianceData = {
          ...complianceData,
          verifiedAt: new Date().toISOString(),
        };
      }
      await queryRunner.manager.save(org);
      orgId = org.id;

      const liveWallet = new Wallet();
      liveWallet.environment = Environment.LIVE;
      liveWallet.org_id = org.id;
      liveWallet.balance = 0;
      await queryRunner.manager.save(liveWallet);

      const sandboxWallet = new Wallet();
      sandboxWallet.environment = Environment.SANDBOX;
      sandboxWallet.org_id = org.id;
      sandboxWallet.balance = 100000; // 100,000 NGX free sandbox credits
      await queryRunner.manager.save(sandboxWallet);

      const user = new User();
      user.email = email;
      user.passwordHash = await bcrypt.hash(password, 10);
      user.role = UserRole.ADMIN;
      user.org_id = org.id;
      await queryRunner.manager.save(user);
      userId = user.id;

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw new BadRequestException('Registration failed');
    }

    await queryRunner.release();

    // Generate initial default sandbox API key
    await this.generateApiKey(orgId, Environment.SANDBOX, 'Default Sandbox Key');

    // Async tasks after successful DB commit
    try {
      const customerCode = await this.paystackService.createCustomer(email, orgName);
      await this.paystackService.createDedicatedAccount(customerCode);
      await this.notificationsService.sendWelcomeEmail(email, orgName);
    } catch (e) {
      console.error('Failed to run post-registration hooks', e);
    }

    const payload = { sub: userId, email, org_id: orgId, role: UserRole.ADMIN };
    return {
      message: 'Registration successful',
      access_token: await this.jwtService.signAsync(payload),
      user: { id: userId, email, org_id: orgId, role: UserRole.ADMIN, org_name: orgName }
    };
  }

  async login(email: string, pass: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const org = await this.orgRepository.findOne({ where: { id: user.org_id } });

    const payload = { sub: user.id, email: user.email, org_id: user.org_id, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        org_id: user.org_id,
        role: user.role,
        org_name: org?.name || 'Organization',
      }
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const org = await this.orgRepository.findOne({ where: { id: user.org_id } });
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
      org_name: org?.name || 'Organization',
      created_at: user.createdAt,
    };
  }

  async generateApiKey(orgId: string, environment: Environment, name = 'API Key') {
    const targetEnv = String(environment).toLowerCase() === 'live' ? Environment.LIVE : Environment.SANDBOX;
    const prefix = targetEnv === Environment.LIVE ? 'vrx_live_' : 'vrx_test_';
    const secret = uuidv4().replace(/-/g, '');
    
    // Hash ONLY the secret part
    const keyHash = await bcrypt.hash(secret, 10);

    const apiKey = new ApiKey();
    apiKey.org_id = orgId;
    apiKey.environment = targetEnv;
    apiKey.keyPrefix = prefix;
    apiKey.keyHash = keyHash;
    apiKey.isActive = true;

    await this.apiKeyRepository.save(apiKey);

    // The token includes the database ID for O(1) lookups
    const rawKey = `${prefix}${apiKey.id}_${secret}`;

    return {
      id: apiKey.id,
      name,
      environment: targetEnv.toLowerCase(),
      keyPrefix: prefix,
      rawKey,
      createdAt: apiKey.createdAt,
    };
  }

  async listApiKeys(orgId: string) {
    const keys = await this.apiKeyRepository.find({
      where: { org_id: orgId },
      order: { createdAt: 'DESC' },
    });

    return keys.map((k) => ({
      id: k.id,
      name: k.environment === Environment.LIVE ? 'Production Secret Key' : 'Sandbox Test Key',
      environment: k.environment.toLowerCase(),
      keyPrefix: k.keyPrefix,
      displayKey: `${k.keyPrefix}${k.id.slice(0, 8)}****************`,
      isActive: k.isActive,
      createdAt: k.createdAt,
    }));
  }

  async revokeApiKey(orgId: string, keyId: string) {
    const key = await this.apiKeyRepository.findOne({ where: { id: keyId, org_id: orgId } });
    if (!key) {
      throw new NotFoundException('API Key not found');
    }
    key.isActive = false;
    await this.apiKeyRepository.save(key);
    return { message: 'API key revoked successfully' };
  }
}

import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './entities/system-config.entity';
import { Organization, OrganizationTier } from '../organizations/entities/organization.entity';
import { Environment } from '../organizations/entities/environment-config.entity';
import { Transaction, TransactionStatus } from '../billing/entities/transaction.entity';
import { VerificationLog, VerificationStatus } from '../verifications/entities/verification-log.entity';
import { NotificationsService } from '../notifications/notifications.service';
import * as crypto from 'crypto';

const ENCRYPTION_KEY = (process.env.SYSTEM_ENCRYPTION_KEY || '01234567890123456789012345678901').slice(0, 32);
const IV_LENGTH = 16;

function encryptSecret(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptSecret(text: string): string {
  try {
    const textParts = text.split(':');
    if (textParts.length < 2) return text;
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return text;
  }
}

@Injectable()
export class AdminService implements OnModuleInit {
  private configCache: Record<string, string> = {};

  constructor(
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(Transaction)
    private txRepository: Repository<Transaction>,
    @InjectRepository(VerificationLog)
    private verifyLogRepository: Repository<VerificationLog>,
    private notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    await this.refreshConfigCache();
  }

  async refreshConfigCache() {
    const configs = await this.configRepository.find();
    configs.forEach((c) => {
      this.configCache[c.key] = c.isSecret ? decryptSecret(c.value) : c.value;
    });
  }

  getConfig(key: string): string {
    return this.configCache[key];
  }

  async updateConfig(key: string, value: string, isSecret = false, description?: string) {
    let config = await this.configRepository.findOne({ where: { key } });
    if (!config) {
      config = new SystemConfig();
      config.key = key;
    }
    config.value = isSecret ? encryptSecret(value) : value;
    config.isSecret = isSecret;
    if (description) config.description = description;

    await this.configRepository.save(config);
    this.configCache[key] = value;
    return config;
  }

  async getAllConfigs() {
    const configs = await this.configRepository.find();
    return configs.map((c) => ({
      key: c.key,
      value: c.isSecret ? '••••••••••••••••' : c.value,
      isSecret: c.isSecret,
      description: c.description,
      updatedAt: c.updatedAt,
    }));
  }

  async getPricingConfig() {
    const configs = await this.configRepository.find();
    const map: Record<string, string> = {};
    configs.forEach(c => map[c.key] = c.value);

    return {
      baseRates: {
        bvn: parseInt(map['BASE_BVN_PRICE'] || '50', 10),
        nin: parseInt(map['BASE_NIN_PRICE'] || '50', 10),
        ninAdvance: parseInt(map['BASE_NIN_ADVANCE_PRICE'] || '140', 10),
        ninSlip: parseInt(map['BASE_NIN_SLIP_PRICE'] || '270', 10),
        nuban: parseInt(map['BASE_NUBAN_PRICE'] || '10', 10),
      },
      cacheRates: {
        bvn: parseInt(map['BASE_BVN_CACHE_PRICE'] || '20', 10),
        nin: parseInt(map['BASE_NIN_CACHE_PRICE'] || '20', 10),
        ninAdvance: parseInt(map['BASE_NIN_ADVANCE_CACHE_PRICE'] || '30', 10),
        ninSlip: parseInt(map['BASE_NIN_SLIP_CACHE_PRICE'] || '50', 10),
        nuban: parseInt(map['BASE_NUBAN_CACHE_PRICE'] || '5', 10),
      },
      cacheSettings: {
        enabled: map['SMART_CACHE_ENABLED'] !== 'false',
        ttlDays: parseInt(map['CACHE_TTL_DAYS'] || '30', 10),
      },
      bonusPromotion: {
        active: map['BONUS_DISCOUNT_ACTIVE'] === 'true',
        discountPercent: parseInt(map['BONUS_DISCOUNT_PERCENT'] || '0', 10),
        title: map['BONUS_DISCOUNT_TITLE'] || 'Flash Sale Active',
        expiry: map['BONUS_DISCOUNT_EXPIRY'] || null,
      },
    };
  }

  async updatePricing(body: {
    baseRates?: { bvn?: number; nin?: number; ninAdvance?: number; ninSlip?: number; nuban?: number };
    cacheRates?: { bvn?: number; nin?: number; ninAdvance?: number; ninSlip?: number; nuban?: number };
    cacheSettings?: { enabled?: boolean; ttlDays?: number };
    bonusPromotion?: { active: boolean; discountPercent: number; title: string; expiry?: string };
  }) {
    if (body.baseRates) {
      if (body.baseRates.bvn != null) await this.updateConfig('BASE_BVN_PRICE', String(body.baseRates.bvn), false, 'Base BVN Live Price');
      if (body.baseRates.nin != null) await this.updateConfig('BASE_NIN_PRICE', String(body.baseRates.nin), false, 'Base NIN Live Price');
      if (body.baseRates.ninAdvance != null) await this.updateConfig('BASE_NIN_ADVANCE_PRICE', String(body.baseRates.ninAdvance), false, 'Base NIN Advance Live Price');
      if (body.baseRates.ninSlip != null) await this.updateConfig('BASE_NIN_SLIP_PRICE', String(body.baseRates.ninSlip), false, 'Base NIN Slip Generation Price');
      if (body.baseRates.nuban != null) await this.updateConfig('BASE_NUBAN_PRICE', String(body.baseRates.nuban), false, 'Base NUBAN Live Price');
    }

    if (body.cacheRates) {
      if (body.cacheRates.bvn != null) await this.updateConfig('BASE_BVN_CACHE_PRICE', String(body.cacheRates.bvn), false, 'Base BVN Cache Hit Price');
      if (body.cacheRates.nin != null) await this.updateConfig('BASE_NIN_CACHE_PRICE', String(body.cacheRates.nin), false, 'Base NIN Cache Hit Price');
      if (body.cacheRates.ninAdvance != null) await this.updateConfig('BASE_NIN_ADVANCE_CACHE_PRICE', String(body.cacheRates.ninAdvance), false, 'Base NIN Advance Cache Hit Price');
      if (body.cacheRates.ninSlip != null) await this.updateConfig('BASE_NIN_SLIP_CACHE_PRICE', String(body.cacheRates.ninSlip), false, 'Base NIN Slip Cache Hit Price');
      if (body.cacheRates.nuban != null) await this.updateConfig('BASE_NUBAN_CACHE_PRICE', String(body.cacheRates.nuban), false, 'Base NUBAN Cache Hit Price');
    }

    if (body.cacheSettings) {
      if (body.cacheSettings.enabled != null) await this.updateConfig('SMART_CACHE_ENABLED', String(body.cacheSettings.enabled), false, 'Smart Identity Cache Enabled');
      if (body.cacheSettings.ttlDays != null) await this.updateConfig('CACHE_TTL_DAYS', String(body.cacheSettings.ttlDays), false, 'Smart Cache TTL in Days');
    }

    if (body.bonusPromotion) {
      await this.updateConfig('BONUS_DISCOUNT_ACTIVE', String(body.bonusPromotion.active), false, 'Bonus Days Active');
      await this.updateConfig('BONUS_DISCOUNT_PERCENT', String(body.bonusPromotion.discountPercent), false, 'Bonus Discount Percent');
      await this.updateConfig('BONUS_DISCOUNT_TITLE', body.bonusPromotion.title, false, 'Bonus Discount Title');
      if (body.bonusPromotion.expiry) {
        await this.updateConfig('BONUS_DISCOUNT_EXPIRY', body.bonusPromotion.expiry, false, 'Bonus Expiry Date');
      }
    }

    return this.getPricingConfig();
  }

  async upgradeOrganization(
    orgId: string,
    tier: OrganizationTier,
    customRates?: { bvn?: number; nin?: number; nuban?: number },
    notifyEmail = true
  ) {
    const org = await this.orgRepository.findOne({
      where: { id: orgId },
      relations: { users: true },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    org.tier = tier;
    if (customRates) {
      if (customRates.bvn !== undefined) org.customBvnRate = customRates.bvn;
      if (customRates.nin !== undefined) org.customNinRate = customRates.nin;
      if (customRates.nuban !== undefined) org.customNubanRate = customRates.nuban;
    }

    await this.orgRepository.save(org);

    // Compute effective rates for email notice
    const effectiveBvn = org.customBvnRate != null ? org.customBvnRate : (tier === OrganizationTier.ENTERPRISE ? 35 : (tier === OrganizationTier.GROWTH ? 45 : 50));
    const effectiveNin = org.customNinRate != null ? org.customNinRate : (tier === OrganizationTier.ENTERPRISE ? 35 : (tier === OrganizationTier.GROWTH ? 45 : 50));
    const effectiveNuban = org.customNubanRate != null ? org.customNubanRate : (tier === OrganizationTier.ENTERPRISE ? 7 : (tier === OrganizationTier.GROWTH ? 9 : 10));

    if (notifyEmail && org.users?.length) {
      for (const u of org.users) {
        try {
          await this.notificationsService.sendPlanUpgradeEmail(
            u.email,
            org.name,
            tier,
            { bvn: effectiveBvn, nin: effectiveNin, nuban: effectiveNuban }
          );
        } catch (e) {
          console.error('Failed to dispatch upgrade email', e);
        }
      }
    }

    return {
      message: `Organization successfully upgraded to ${tier}`,
      organization: {
        id: org.id,
        name: org.name,
        tier: org.tier,
        customRates: {
          bvn: org.customBvnRate,
          nin: org.customNinRate,
          nuban: org.customNubanRate,
        },
      },
    };
  }

  async getPlatformMetrics() {
    const totalOrgs = await this.orgRepository.count();
    const topups = await this.txRepository.find({
      where: { description: 'Paystack DVA Top-up', status: TransactionStatus.COMPLETED },
    });
    const totalRevenueNgx = topups.reduce((sum, tx) => sum + Number(tx.amount), 0);

    const totalVerifications = await this.verifyLogRepository.count();
    const successfulVerifications = await this.verifyLogRepository.count({
      where: { status: VerificationStatus.SUCCESS },
    });
    const cachedVerifications = await this.verifyLogRepository.count({
      where: { isCached: true },
    });
    const liveVerifications = totalVerifications - cachedVerifications;
    const cacheHitRatio = totalVerifications > 0
      ? ((cachedVerifications / totalVerifications) * 100).toFixed(1) + '%'
      : '0.0%';

    const successRate = totalVerifications > 0 ? ((successfulVerifications / totalVerifications) * 100).toFixed(2) + '%' : '100%';

    return {
      totalOrgs,
      totalRevenueNgx,
      totalVerifications,
      liveVerifications,
      cachedVerifications,
      cacheHitRatio,
      upstreamCallsSaved: cachedVerifications,
      totalSavingsNgx: cachedVerifications * 30,
      successRate,
      averageLatency: '142ms',
    };
  }

  async getOrganizations() {
    const orgs = await this.orgRepository.find({
      relations: { wallets: true, users: true },
      order: { createdAt: 'DESC' },
    });

    return orgs.map((org) => {
      const liveWallet = org.wallets?.find((w) => w.environment === Environment.LIVE);
      const sandboxWallet = org.wallets?.find((w) => w.environment === Environment.SANDBOX);

      return {
        id: org.id,
        name: org.name,
        tier: org.tier || OrganizationTier.STARTER,
        customRates: {
          bvn: org.customBvnRate,
          nin: org.customNinRate,
          nuban: org.customNubanRate,
        },
        complianceData: org.complianceData || null,
        liveBalance: liveWallet ? Number(liveWallet.balance) : 0,
        sandboxBalance: sandboxWallet ? Number(sandboxWallet.balance) : 0,
        usersCount: org.users?.length || 0,
        createdAt: org.createdAt,
      };
    });
  }

  async getProviderHealth() {
    return [
      {
        provider: 'Verixa Core Mock Engine',
        status: 'operational',
        services: ['BVN', 'NIN', 'NUBAN'],
        uptime: '99.98%',
        latency: '142ms',
      },
      {
        provider: 'Paystack Virtual Accounts',
        status: 'operational',
        services: ['DVA Topup', 'Card Checkout'],
        uptime: '99.95%',
        latency: '310ms',
      },
      {
        provider: 'Dojah Upstream Gateway',
        status: this.configCache['DOJAH_SECRET_KEY'] ? 'connected' : 'unconfigured',
        services: ['BVN', 'NIN'],
        uptime: '99.91%',
        latency: '240ms',
      },
      {
        provider: 'SmileID Upstream Gateway',
        status: this.configCache['SMILE_ID_KEY'] ? 'connected' : 'unconfigured',
        services: ['Biometrics', 'NIN'],
        uptime: '99.89%',
        latency: '410ms',
      },
    ];
  }
}

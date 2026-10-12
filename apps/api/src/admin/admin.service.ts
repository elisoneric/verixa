import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { SystemConfig } from './entities/system-config.entity';
import { Organization, OrganizationTier } from '../organizations/entities/organization.entity';
import { Environment } from '../organizations/entities/environment-config.entity';
import { Transaction, TransactionStatus } from '../billing/entities/transaction.entity';
import { VerificationLog, VerificationStatus } from '../verifications/entities/verification-log.entity';
import { Wallet } from '../billing/entities/wallet.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService, SmtpConfig } from '../notifications/notifications.service';
import * as crypto from 'crypto';

function getEncryptionKey(): string {
  const key = process.env.SYSTEM_ENCRYPTION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: SYSTEM_ENCRYPTION_KEY environment variable is missing in production');
    }
    return '01234567890123456789012345678901';
  }
  return key.slice(0, 32);
}

const ENCRYPTION_KEY = getEncryptionKey();
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
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

    // Synchronize SMTP settings with NotificationsService if configured
    this.syncSmtpSettings();
  }

  private syncSmtpSettings() {
    const smtpConfig: SmtpConfig = {
      host: this.configCache['SMTP_HOST'],
      port: this.configCache['SMTP_PORT'] ? parseInt(this.configCache['SMTP_PORT'], 10) : undefined,
      secure: this.configCache['SMTP_SECURE'] ? this.configCache['SMTP_SECURE'] === 'true' : undefined,
      user: this.configCache['SMTP_USER'],
      pass: this.configCache['SMTP_PASS'],
      fromName: this.configCache['SMTP_FROM_NAME'],
      fromEmail: this.configCache['SMTP_FROM_EMAIL'],
    };

    // If at least host or user is provided in DB, push to NotificationsService
    if (smtpConfig.host || smtpConfig.user) {
      this.notificationsService.configure(smtpConfig);
    }
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

    // Check if this was an SMTP setting and re-sync
    if (key.startsWith('SMTP_')) {
      this.syncSmtpSettings();
    }

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
        bvn: parseInt(map['BASE_BVN_PRICE'] || '95', 10),
        nin: parseInt(map['BASE_NIN_PRICE'] || '95', 10),
        ninAdvance: parseInt(map['BASE_NIN_ADVANCE_PRICE'] || '95', 10),
        ninSlip: parseInt(map['BASE_NIN_SLIP_PRICE'] || '250', 10),
        nuban: parseInt(map['BASE_NUBAN_PRICE'] || '0', 10),
        phone: parseInt(map['BASE_PHONE_PRICE'] || '50', 10),
        cac: parseInt(map['BASE_CAC_PRICE'] || '120', 10),
        airtime: parseInt(map['BASE_AIRTIME_PRICE'] || '0', 10),
        data: parseInt(map['BASE_DATA_PRICE'] || '220', 10),
        sms: parseInt(map['BASE_SMS_PRICE'] || '5', 10),
      },
      cacheRates: {
        bvn: parseInt(map['BASE_BVN_CACHE_PRICE'] || '38', 10),
        nin: parseInt(map['BASE_NIN_CACHE_PRICE'] || '38', 10),
        ninAdvance: parseInt(map['BASE_NIN_ADVANCE_CACHE_PRICE'] || '38', 10),
        ninSlip: parseInt(map['BASE_NIN_SLIP_CACHE_PRICE'] || '50', 10),
        nuban: parseInt(map['BASE_NUBAN_CACHE_PRICE'] || '0', 10),
        phone: parseInt(map['BASE_PHONE_CACHE_PRICE'] || '20', 10),
        cac: parseInt(map['BASE_CAC_CACHE_PRICE'] || '48', 10),
      },
      cacheSettings: {
        enabled: map['SMART_CACHE_ENABLED'] !== 'false',
        ttlDays: parseInt(map['CACHE_TTL_DAYS'] || '30', 10),
      },
      tierDiscounts: {
        growthDiscountPercent: 10,
        enterpriseDiscountPercent: 30,
      },
      bonusPromotion: {
        active: map['BONUS_DISCOUNT_ACTIVE'] === 'true',
        discountPercent: parseInt(map['BONUS_DISCOUNT_PERCENT'] || '0', 10),
        title: map['BONUS_DISCOUNT_TITLE'] || 'Special Developer Bonus Days',
        expiry: map['BONUS_DISCOUNT_EXPIRY'] || null,
      },
    };
  }

  async getPublicPricing() {
    return this.getPricingConfig();
  }

  async updatePricing(body: {
    baseRates?: Record<string, number>;
    cacheRates?: Record<string, number>;
    cacheSettings?: { enabled?: boolean; ttlDays?: number };
    bonusPromotion?: { active: boolean; discountPercent: number; title: string; expiry?: string };
  }) {
    if (body.baseRates) {
      if (body.baseRates.bvn != null) await this.updateConfig('BASE_BVN_PRICE', String(body.baseRates.bvn), false, 'Base BVN Live Price');
      if (body.baseRates.nin != null) await this.updateConfig('BASE_NIN_PRICE', String(body.baseRates.nin), false, 'Base NIN Live Price');
      if (body.baseRates.ninAdvance != null) await this.updateConfig('BASE_NIN_ADVANCE_PRICE', String(body.baseRates.ninAdvance), false, 'Base NIN Advance Live Price');
      if (body.baseRates.ninSlip != null) await this.updateConfig('BASE_NIN_SLIP_PRICE', String(body.baseRates.ninSlip), false, 'Base NIN Slip Generation Price');
      if (body.baseRates.nuban != null) await this.updateConfig('BASE_NUBAN_PRICE', String(body.baseRates.nuban), false, 'Base NUBAN Live Price');
      if (body.baseRates.phone != null) await this.updateConfig('BASE_PHONE_PRICE', String(body.baseRates.phone), false, 'Base Phone Lookup Price');
      if (body.baseRates.cac != null) await this.updateConfig('BASE_CAC_PRICE', String(body.baseRates.cac), false, 'Base CAC Verification Price');
      if (body.baseRates.airtime != null) await this.updateConfig('BASE_AIRTIME_PRICE', String(body.baseRates.airtime), false, 'Base Airtime Fee');
      if (body.baseRates.data != null) await this.updateConfig('BASE_DATA_PRICE', String(body.baseRates.data), false, 'Base Data/GB Price');
      if (body.baseRates.sms != null) await this.updateConfig('BASE_SMS_PRICE', String(body.baseRates.sms), false, 'Base SMS Price');
    }

    if (body.cacheRates) {
      if (body.cacheRates.bvn != null) await this.updateConfig('BASE_BVN_CACHE_PRICE', String(body.cacheRates.bvn), false, 'Base BVN Cache Hit Price');
      if (body.cacheRates.nin != null) await this.updateConfig('BASE_NIN_CACHE_PRICE', String(body.cacheRates.nin), false, 'Base NIN Cache Hit Price');
      if (body.cacheRates.ninAdvance != null) await this.updateConfig('BASE_NIN_ADVANCE_CACHE_PRICE', String(body.cacheRates.ninAdvance), false, 'Base NIN Advance Cache Hit Price');
      if (body.cacheRates.ninSlip != null) await this.updateConfig('BASE_NIN_SLIP_CACHE_PRICE', String(body.cacheRates.ninSlip), false, 'Base NIN Slip Cache Hit Price');
      if (body.cacheRates.nuban != null) await this.updateConfig('BASE_NUBAN_CACHE_PRICE', String(body.cacheRates.nuban), false, 'Base NUBAN Cache Hit Price');
      if (body.cacheRates.phone != null) await this.updateConfig('BASE_PHONE_CACHE_PRICE', String(body.cacheRates.phone), false, 'Base Phone Cache Hit Price');
      if (body.cacheRates.cac != null) await this.updateConfig('BASE_CAC_CACHE_PRICE', String(body.cacheRates.cac), false, 'Base CAC Cache Hit Price');
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
    const effectiveNuban = org.customNubanRate != null ? org.customNubanRate : (tier === OrganizationTier.ENTERPRISE ? 0 : (tier === OrganizationTier.GROWTH ? 0 : 0));

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

  async adjustOrganizationBalance(
    orgId: string,
    amount: number,
    environment: 'live' | 'sandbox',
    reason = 'Administrator Balance Adjustment',
    notifyEmail = true
  ) {
    const org = await this.orgRepository.findOne({
      where: { id: orgId },
      relations: { wallets: true, users: true },
    });
    if (!org) throw new NotFoundException('Organization not found');

    const envEnum = environment === 'live' ? Environment.LIVE : Environment.SANDBOX;
    let wallet = org.wallets?.find((w) => w.environment === envEnum);

    if (!wallet) {
      wallet = new Wallet();
      wallet.org_id = org.id;
      wallet.organization = org;
      wallet.environment = envEnum;
      wallet.balance = 0;
      await this.walletRepository.save(wallet);
    }

    const currentBalance = Number(wallet.balance) || 0;
    const newBalance = currentBalance + amount;
    if (newBalance < 0) {
      throw new BadRequestException(`Insufficient balance. Adjustment would result in negative balance (${newBalance} NGX)`);
    }

    wallet.balance = newBalance;
    await this.walletRepository.save(wallet);

    // Record ledger transaction
    const tx = new Transaction();
    tx.wallet_id = wallet.id;
    tx.wallet = wallet;
    tx.amount = amount;
    tx.status = TransactionStatus.COMPLETED;
    tx.description = reason;
    tx.referenceId = `admin_adj_${Date.now()}`;
    await this.txRepository.save(tx);

    if (notifyEmail && org.users?.length) {
      for (const u of org.users) {
        try {
          await this.notificationsService.sendBalanceAdjustmentEmail(
            u.email,
            org.name,
            amount,
            environment,
            reason,
            newBalance
          );
        } catch (e) {
          console.error('Failed to dispatch adjustment notification', e);
        }
      }
    }

    return {
      success: true,
      orgId: org.id,
      environment,
      previousBalance: currentBalance,
      adjustmentAmount: amount,
      newBalance,
      transactionId: tx.id,
    };
  }

  async updateOrganizationStatus(orgId: string, status: 'active' | 'suspended') {
    const org = await this.orgRepository.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');

    org.complianceData = {
      ...(org.complianceData || {}),
      status,
      statusUpdatedAt: new Date().toISOString(),
    };
    await this.orgRepository.save(org);

    return {
      success: true,
      orgId: org.id,
      status,
    };
  }

  async getOrganizationUsers(orgId: string) {
    const org = await this.orgRepository.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');

    const users = await this.userRepository.find({
      where: { org_id: orgId },
      order: { createdAt: 'DESC' },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));
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

    const avgLatencyQuery = await this.verifyLogRepository
      .createQueryBuilder('log')
      .select('AVG(log.latencyMs)', 'avg')
      .getRawOne();
    const averageLatency = `${Math.round(Number(avgLatencyQuery?.avg) || 142)}ms`;

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
      averageLatency,
    };
  }

  async getRevenueMetrics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Total top-up deposits via SQL aggregation
    const totalDepositedRes = await this.txRepository
      .createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'sum')
      .where('tx.status = :status AND tx.amount > 0', { status: TransactionStatus.COMPLETED })
      .getRawOne();
    const totalDepositedNgx = Number(totalDepositedRes?.sum) || 0;

    // 2. Total consumed credits via SQL aggregation
    const totalConsumedRes = await this.txRepository
      .createQueryBuilder('tx')
      .select('SUM(ABS(tx.amount))', 'sum')
      .where('tx.status = :status AND tx.amount < 0', { status: TransactionStatus.COMPLETED })
      .getRawOne();
    const totalConsumedNgx = Number(totalConsumedRes?.sum) || 0;

    // 3. Time-window aggregations directly in DB
    const [depositsTodayRes, depositsThisWeekRes, depositsThisMonthRes] = await Promise.all([
      this.txRepository
        .createQueryBuilder('tx')
        .select('SUM(tx.amount)', 'sum')
        .where('tx.status = :status AND tx.amount > 0 AND tx.createdAt >= :date', {
          status: TransactionStatus.COMPLETED,
          date: startOfToday,
        })
        .getRawOne(),
      this.txRepository
        .createQueryBuilder('tx')
        .select('SUM(tx.amount)', 'sum')
        .where('tx.status = :status AND tx.amount > 0 AND tx.createdAt >= :date', {
          status: TransactionStatus.COMPLETED,
          date: startOfWeek,
        })
        .getRawOne(),
      this.txRepository
        .createQueryBuilder('tx')
        .select('SUM(tx.amount)', 'sum')
        .where('tx.status = :status AND tx.amount > 0 AND tx.createdAt >= :date', {
          status: TransactionStatus.COMPLETED,
          date: startOfMonth,
        })
        .getRawOne(),
    ]);

    const depositsToday = Number(depositsTodayRes?.sum) || 0;
    const depositsThisWeek = Number(depositsThisWeekRes?.sum) || 0;
    const depositsThisMonth = Number(depositsThisMonthRes?.sum) || 0;

    // Get recent 50 transactions with org details
    const recentTx = await this.txRepository.find({
      relations: { wallet: { organization: true } },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return {
      totalDepositedNgx,
      totalConsumedNgx,
      depositsToday,
      depositsThisWeek,
      depositsThisMonth,
      netReserveNgx: totalDepositedNgx - totalConsumedNgx,
      recentTransactions: recentTx.map(t => ({
        id: t.id,
        amount: Number(t.amount),
        status: t.status,
        description: t.description || 'Transaction',
        referenceId: t.referenceId,
        orgName: t.wallet?.organization?.name || 'Unknown Tenant',
        orgId: t.wallet?.org_id,
        environment: t.wallet?.environment || 'live',
        createdAt: t.createdAt,
      })),
    };
  }

  async getClusterLogs(query: {
    limit?: number;
    offset?: number;
    serviceType?: string;
    status?: string;
    orgId?: string;
  }) {
    const limit = Math.min(query.limit || 50, 100);
    const offset = query.offset || 0;

    const qb = this.verifyLogRepository.createQueryBuilder('log')
      .leftJoin(Organization, 'org', 'org.id = log.org_id')
      .addSelect('org.name', 'orgName')
      .orderBy('log.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    if (query.serviceType) {
      qb.andWhere('log.serviceType = :serviceType', { serviceType: query.serviceType });
    }
    if (query.status) {
      qb.andWhere('log.status = :status', { status: query.status });
    }
    if (query.orgId) {
      qb.andWhere('log.org_id = :orgId', { orgId: query.orgId });
    }

    const [rawLogs, totalCount] = await Promise.all([
      qb.getRawAndEntities(),
      qb.getCount(),
    ]);

    const logs = rawLogs.entities.map((entity, idx) => {
      const raw = rawLogs.raw[idx];
      return {
        id: entity.id,
        orgId: entity.org_id,
        orgName: raw?.orgName || 'Tenant Org',
        serviceType: entity.serviceType,
        status: entity.status,
        isCached: entity.isCached,
        source: entity.source,
        upstreamProvider: entity.upstreamProvider,
        costDeducted: Number(entity.costDeducted || 0),
        latencyMs: entity.latencyMs || 0,
        createdAt: entity.createdAt,
      };
    });

    return {
      total: totalCount,
      limit,
      offset,
      logs,
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
        status: org.complianceData?.status || 'active',
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

  async testSmtpConnection(to: string, customConfig?: SmtpConfig) {
    return this.notificationsService.sendTestEmail(to, customConfig);
  }

  async broadcastPromotion(discountPercent: number, title: string) {
    const users = await this.userRepository.find({ select: { email: true } });
    const distinctEmails = Array.from(new Set(users.map(u => u.email.toLowerCase()))).filter(Boolean);

    let sentCount = 0;
    for (const email of distinctEmails) {
      try {
        await this.notificationsService.sendBonusDayAnnouncement(email, discountPercent, title);
        sentCount++;
      } catch (err) {
        console.error(`Failed to send promo email to ${email}`, err);
      }
    }

    return {
      success: true,
      sentCount,
      totalRecipients: distinctEmails.length,
    };
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
        status: this.configCache['PAYSTACK_SECRET_KEY'] ? 'operational' : 'connected',
        services: ['DVA Topup', 'Card Checkout'],
        uptime: '99.95%',
        latency: '310ms',
      },
      {
        provider: 'Dojah Upstream Gateway',
        status: (this.configCache['DOJAH_SECRET_KEY'] || this.configCache['vx_SECRET_KEY'] || process.env.DOJAH_SECRET_KEY || process.env.vx_SECRET_KEY) ? 'connected' : 'unconfigured',
        services: ['BVN', 'NIN', 'NIN Advance'],
        uptime: '99.91%',
        latency: '240ms',
      },
      {
        provider: 'SmileID Upstream Gateway',
        status: (this.configCache['SMILE_ID_KEY'] || process.env.SMILE_ID_KEY) ? 'connected' : 'unconfigured',
        services: ['Biometrics', 'NIN'],
        uptime: '99.89%',
        latency: '410ms',
      },
      {
        provider: 'SMTP Email Delivery',
        status: (this.configCache['SMTP_HOST'] || process.env.SMTP_HOST) ? 'operational' : 'connected',
        services: ['Alerts', 'Receipts', 'Welcome'],
        uptime: '99.99%',
        latency: '180ms',
      },
    ];
  }
}

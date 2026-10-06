import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { Environment, EnvironmentConfig } from '../organizations/entities/environment-config.entity';
import { User } from '../users/entities/user.entity';
import { Organization, OrganizationTier } from '../organizations/entities/organization.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { PaystackService } from './paystack.service';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private dataSource: DataSource,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
    @InjectRepository(EnvironmentConfig)
    private envConfigRepository: Repository<EnvironmentConfig>,
    private notificationsService: NotificationsService,
    private paystackService: PaystackService,
  ) {}

  async getEffectiveRate(
    orgId: string,
    serviceType: 'bvn' | 'nin' | 'nuban' | 'nin_advance' | 'nin_slip',
    isCacheHit = false
  ): Promise<{
    effectiveRate: number;
    baseRate: number;
    discountPercent: number;
    tier: string;
    isCustom: boolean;
    isCacheHit: boolean;
  }> {
    const org = await this.orgRepository.findOne({ where: { id: orgId } });
    const configs = await this.configRepository.find();
    const configMap: Record<string, string> = {};
    configs.forEach(c => configMap[c.key] = c.value);

    // 1. Base default prices (Live vs Smart Cache)
    let defaultLive = 50;
    let defaultCache = 20;

    if (serviceType === 'nuban') {
      return {
        effectiveRate: 0,
        baseRate: 0,
        discountPercent: 100,
        tier: org?.tier || OrganizationTier.STARTER,
        isCustom: false,
        isCacheHit,
      };
    } else if (serviceType === 'nin_advance') {
      defaultLive = 140;
      defaultCache = 30;
    } else if (serviceType === 'nin_slip') {
      defaultLive = 270;
      defaultCache = 50;
    }

    let baseRate = isCacheHit ? defaultCache : defaultLive;
    
    if (isCacheHit) {
      if (serviceType === 'bvn' && configMap['BASE_BVN_CACHE_PRICE']) baseRate = parseInt(configMap['BASE_BVN_CACHE_PRICE'], 10);
      if (serviceType === 'nin' && configMap['BASE_NIN_CACHE_PRICE']) baseRate = parseInt(configMap['BASE_NIN_CACHE_PRICE'], 10);
      if (serviceType === 'nin_advance' && configMap['BASE_NIN_ADVANCE_CACHE_PRICE']) baseRate = parseInt(configMap['BASE_NIN_ADVANCE_CACHE_PRICE'], 10);
      if (serviceType === 'nin_slip' && configMap['BASE_NIN_SLIP_CACHE_PRICE']) baseRate = parseInt(configMap['BASE_NIN_SLIP_CACHE_PRICE'], 10);
    } else {
      if (serviceType === 'bvn' && configMap['BASE_BVN_PRICE']) baseRate = parseInt(configMap['BASE_BVN_PRICE'], 10);
      if (serviceType === 'nin' && configMap['BASE_NIN_PRICE']) baseRate = parseInt(configMap['BASE_NIN_PRICE'], 10);
      if (serviceType === 'nin_advance' && configMap['BASE_NIN_ADVANCE_PRICE']) baseRate = parseInt(configMap['BASE_NIN_ADVANCE_PRICE'], 10);
      if (serviceType === 'nin_slip' && configMap['BASE_NIN_SLIP_PRICE']) baseRate = parseInt(configMap['BASE_NIN_SLIP_PRICE'], 10);
    }

    let price = baseRate;
    let isCustom = false;

    // 2. Custom org rate if explicitly set (applies primarily to live calls)
    if (!isCacheHit) {
      if (serviceType === 'bvn' && org?.customBvnRate != null) {
        price = org.customBvnRate;
        isCustom = true;
      } else if (serviceType === 'nin' && org?.customNinRate != null) {
        price = org.customNinRate;
        isCustom = true;
      } else {
        // 3. Organization tier standard pricing
        if (org?.tier === OrganizationTier.ENTERPRISE) {
          if (serviceType === 'nin_advance') price = 120;
          else if (serviceType === 'nin_slip') price = 230;
          else price = 35;
        } else if (org?.tier === OrganizationTier.GROWTH) {
          if (serviceType === 'nin_advance') price = 130;
          else if (serviceType === 'nin_slip') price = 250;
          else price = 45;
        }
      }
    } else {
      // Tier savings on cache hits
      if (org?.tier === OrganizationTier.ENTERPRISE) {
        if (serviceType === 'nin_advance') price = 20;
        else if (serviceType === 'nin_slip') price = 35;
        else price = 15;
      } else if (org?.tier === OrganizationTier.GROWTH) {
        if (serviceType === 'nin_advance') price = 25;
        else if (serviceType === 'nin_slip') price = 40;
        else price = 18;
      }
    }

    // 4. Bonus Day / Promotional Slash
    const bonusActive = configMap['BONUS_DISCOUNT_ACTIVE'] === 'true';
    const bonusPercent = parseInt(configMap['BONUS_DISCOUNT_PERCENT'] || '0', 10);

    if (bonusActive && bonusPercent > 0) {
      price = Math.max(1, Math.round(price * (1 - bonusPercent / 100)));
    }

    const discountPercent = Math.round(((baseRate - price) / baseRate) * 100);

    return {
      effectiveRate: price,
      baseRate,
      discountPercent: Math.max(0, discountPercent),
      tier: org?.tier || 'STARTER',
      isCustom,
      isCacheHit,
    };
  }

  async getBalance(orgId: string) {
    const org = await this.orgRepository.findOne({ where: { id: orgId } });
    const wallets = await this.walletRepository.find({ where: { org_id: orgId } });
    const liveWallet = wallets.find((w) => w.environment === Environment.LIVE);
    const sandboxWallet = wallets.find((w) => w.environment === Environment.SANDBOX);

    const bvnLive = await this.getEffectiveRate(orgId, 'bvn', false);
    const ninLive = await this.getEffectiveRate(orgId, 'nin', false);
    const nubanLive = await this.getEffectiveRate(orgId, 'nuban', false);

    const bvnCache = await this.getEffectiveRate(orgId, 'bvn', true);
    const ninCache = await this.getEffectiveRate(orgId, 'nin', true);
    const nubanCache = await this.getEffectiveRate(orgId, 'nuban', true);

    const configs = await this.configRepository.find();
    const configMap: Record<string, string> = {};
    configs.forEach(c => configMap[c.key] = c.value);

    const bonusActive = configMap['BONUS_DISCOUNT_ACTIVE'] === 'true';
    const bonusTitle = configMap['BONUS_DISCOUNT_TITLE'] || 'Flash Sale Active';
    const bonusPercent = parseInt(configMap['BONUS_DISCOUNT_PERCENT'] || '0', 10);

    return {
      live: {
        balance: liveWallet ? Number(liveWallet.balance) : 0,
        currency: 'NGX',
      },
      sandbox: {
        balance: sandboxWallet ? Number(sandboxWallet.balance) : 0,
        currency: 'NGX',
      },
      dedicatedVirtualAccount: {
        bankName: 'Titan Trust Bank',
        accountNumber: '9940182741',
        accountName: 'Verixa ID / Settlement',
        status: 'active',
        note: 'Funds transferred to this account auto-credit your Live NGX balance instantly via Paystack.',
      },
      tier: org?.tier || OrganizationTier.STARTER,
      rates: {
        bvn: bvnLive.effectiveRate,
        nin: ninLive.effectiveRate,
        nuban: nubanLive.effectiveRate,
        live: {
          bvn: bvnLive.effectiveRate,
          nin: ninLive.effectiveRate,
          nuban: nubanLive.effectiveRate,
        },
        cache: {
          bvn: bvnCache.effectiveRate,
          nin: ninCache.effectiveRate,
          nuban: nubanCache.effectiveRate,
        },
        cacheSavingsPercent: Math.round(((bvnLive.effectiveRate - bvnCache.effectiveRate) / bvnLive.effectiveRate) * 100),
      },
      bonusPromotion: bonusActive && bonusPercent > 0 ? {
        active: true,
        title: bonusTitle,
        discountPercent: bonusPercent,
      } : null,
    };
  }

  async getTransactions(orgId: string) {
    const wallets = await this.walletRepository.find({ where: { org_id: orgId } });
    if (!wallets.length) return [];

    const walletIds = wallets.map((w) => w.id);
    const transactions = await this.transactionRepository.find({
      where: { wallet_id: In(walletIds) },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return transactions.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      status: t.status,
      referenceId: t.referenceId,
      description: t.description,
      createdAt: t.createdAt,
    }));
  }

  async deductCredits(orgId: string, environment: Environment, amount: number, referenceId: string): Promise<void> {
    const targetEnv = String(environment).toLowerCase() === 'live' ? Environment.LIVE : Environment.SANDBOX;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { org_id: orgId, environment: targetEnv },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found for this environment');
      }

      if (Number(wallet.balance) < amount) {
        throw new BadRequestException(`Insufficient NGX balance. Required: ${amount} NGX, Available: ${wallet.balance} NGX`);
      }

      wallet.balance = Number(wallet.balance) - amount;
      await queryRunner.manager.save(wallet);

      const transaction = new Transaction();
      transaction.wallet_id = wallet.id;
      transaction.amount = -amount;
      transaction.status = TransactionStatus.COMPLETED;
      transaction.referenceId = referenceId;
      transaction.description = `API Verification (${targetEnv.toUpperCase()})`;

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process billing deduction');
    } finally {
      await queryRunner.release();
    }
  }

  async refundCredits(orgId: string, environment: Environment, amount: number, originalReferenceId: string): Promise<void> {
    const targetEnv = String(environment).toLowerCase() === 'live' ? Environment.LIVE : Environment.SANDBOX;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { org_id: orgId, environment: targetEnv },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) return;

      wallet.balance = Number(wallet.balance) + amount;
      await queryRunner.manager.save(wallet);

      const refundTx = new Transaction();
      refundTx.wallet_id = wallet.id;
      refundTx.amount = amount;
      refundTx.status = TransactionStatus.COMPLETED;
      refundTx.referenceId = `ref_${originalReferenceId}`;
      refundTx.description = `Refund: Upstream provider failure (${originalReferenceId.slice(0, 8)})`;

      await queryRunner.manager.save(refundTx);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Failed to process refund', error);
    } finally {
      await queryRunner.release();
    }
  }

  async fundSandbox(orgId: string, amount = 10000): Promise<{ balance: number }> {
    const wallet = await this.walletRepository.findOne({
      where: { org_id: orgId, environment: Environment.SANDBOX },
    });
    if (!wallet) {
      throw new NotFoundException('Sandbox wallet not found');
    }
    wallet.balance = Number(wallet.balance) + amount;
    await this.walletRepository.save(wallet);
    return { balance: wallet.balance };
  }

  async handleSuccessfulTopup(email: string, amountNgx: number, reference: string, orgId?: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let targetOrgId = orgId;
    let targetEmail = email;

    try {
      if (!targetOrgId && email) {
        const user = await queryRunner.manager.findOne(User, { where: { email } });
        if (user) {
          targetOrgId = user.org_id;
        }
      }

      if (!targetOrgId) {
        const firstOrg = await queryRunner.manager.findOne(Organization, {
          relations: { users: true },
        });
        if (firstOrg) {
          targetOrgId = firstOrg.id;
          targetEmail = targetEmail || firstOrg.users?.[0]?.email || 'finance@verixa.internal';
        }
      }

      if (!targetOrgId) {
        throw new Error('Organization not found for topup webhook');
      }

      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { org_id: targetOrgId, environment: Environment.LIVE },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new Error('Live wallet not found');
      }

      const existingTx = await queryRunner.manager.findOne(Transaction, { where: { referenceId: reference } });
      if (existingTx) {
        await queryRunner.rollbackTransaction();
        return;
      }

      wallet.balance = Number(wallet.balance) + amountNgx;
      await queryRunner.manager.save(wallet);

      const transaction = new Transaction();
      transaction.wallet_id = wallet.id;
      transaction.amount = amountNgx;
      transaction.status = TransactionStatus.COMPLETED;
      transaction.referenceId = reference;
      transaction.description = 'Paystack Top-up / Payment';
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      if (targetEmail) {
        await this.notificationsService.sendTopUpSuccessEmail(targetEmail, amountNgx, wallet.balance);
      }

      this.dispatchClientWebhook(targetOrgId, {
        reference,
        amount: amountNgx,
        currency: 'NGN',
        balance: wallet.balance,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async verifyPayment(reference: string, orgId?: string) {
    // 1. Check local DB first
    const existingTx = await this.transactionRepository.findOne({
      where: { referenceId: reference },
      relations: { wallet: true },
    });

    if (existingTx && existingTx.status === TransactionStatus.COMPLETED) {
      return {
        status: 'success',
        reference: existingTx.referenceId,
        paymentStatus: 'COMPLETED',
        amount: existingTx.amount,
        currency: 'NGN',
        description: existingTx.description,
        paidAt: existingTx.createdAt,
      };
    }

    // 2. Query Paystack directly for live verification
    const paystackRes = await this.paystackService.verifyTransaction(reference);
    if (!paystackRes) {
      throw new NotFoundException(`Payment reference ${reference} not found or verification failed`);
    }

    if (paystackRes.status === 'success') {
      await this.handleSuccessfulTopup(paystackRes.customerEmail || '', paystackRes.amount, reference, orgId);
      return {
        status: 'success',
        reference: paystackRes.reference,
        paymentStatus: 'COMPLETED',
        amount: paystackRes.amount,
        currency: 'NGN',
        description: 'Paystack Verified Checkout',
        paidAt: paystackRes.paidAt || new Date().toISOString(),
      };
    }

    return {
      status: 'success',
      reference: paystackRes.reference,
      paymentStatus: paystackRes.status.toUpperCase(),
      amount: paystackRes.amount,
      currency: 'NGN',
      description: 'Paystack Checkout Incomplete',
      paidAt: paystackRes.paidAt || null,
    };
  }

  private async dispatchClientWebhook(orgId: string, data: any) {
    try {
      const envConfig = await this.envConfigRepository.findOne({
        where: { org_id: orgId, environment: Environment.LIVE },
      });
      if (!envConfig || !envConfig.webhookUrl) return;

      const payload = {
        event: 'payment.completed',
        timestamp: new Date().toISOString(),
        data,
      };
      const secret = envConfig.webhookSecret || 'secret';
      const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

      axios.post(envConfig.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Verixa-Signature': signature,
        },
        timeout: 5000,
      }).catch(err => {
        this.logger.warn(`Failed to dispatch client webhook to ${envConfig.webhookUrl}: ${err.message}`);
      });
    } catch {
      // Ignore webhook failure
    }
  }
}

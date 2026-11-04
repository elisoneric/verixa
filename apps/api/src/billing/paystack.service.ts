import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { decryptSecret } from '../common/utils/crypto.util';
import axios from 'axios';

export interface CheckoutResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerificationResult {
  status: string;
  reference: string;
  amount: number;
  customerEmail?: string;
  paidAt?: string;
}

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);

  constructor(
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
  ) {}

  public async getSecretKey(): Promise<string> {
    try {
      const dbConfig = await this.configRepository.findOne({ where: { key: 'PAYSTACK_SECRET_KEY' } });
      if (dbConfig && dbConfig.value && !dbConfig.value.startsWith('sk_test_mock')) {
        const decrypted = dbConfig.isSecret ? decryptSecret(dbConfig.value) : dbConfig.value;
        return decrypted.trim();
      }
    } catch {
      // Ignore and fallback to environment variable
    }
    return process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_secret_key';
  }

  async createCustomer(email: string, orgName: string, phone?: string) {
    const key = await this.getSecretKey();
    if (!key || key.startsWith('sk_test_mock')) {
      return 'CUS_mock123';
    }
    try {
      const payload: any = { email, first_name: orgName, last_name: 'Organization' };
      if (phone) {
        payload.phone = phone;
      }
      const response = await axios.post(
        'https://api.paystack.co/customer',
        payload,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      return response.data.data.customer_code;
    } catch (error: any) {
      this.logger.error('Failed to create Paystack customer', error?.response?.data || error.message);
      return 'CUS_mock123';
    }
  }

  async createDedicatedAccount(customerCode: string, options?: { nin?: string; phone?: string; orgName?: string }) {
    const key = await this.getSecretKey();

    if (!key || key.startsWith('sk_test_mock')) {
      throw new BadRequestException('Paystack Dedicated Virtual Account provisioning requires active live Paystack credentials. Please configure PAYSTACK_SECRET_KEY in production.');
    }

    // Ensure customer has phone attached on Paystack
    if (options?.phone && customerCode && !customerCode.startsWith('CUS_mock')) {
      try {
        await axios.put(
          `https://api.paystack.co/customer/${customerCode}`,
          { phone: options.phone, first_name: options.orgName || 'Organization' },
          { headers: { Authorization: `Bearer ${key}` } }
        );
      } catch (err: any) {
        this.logger.warn(`Could not update customer phone on Paystack: ${err?.response?.data?.message || err.message}`);
      }
    }

    try {
      const dvaPayload: any = {
        customer: customerCode,
        preferred_bank: 'titan-paystack',
      };
      if (options?.phone) {
        dvaPayload.phone = options.phone;
      }

      const response = await axios.post(
        'https://api.paystack.co/dedicated_account',
        dvaPayload,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      return {
        bank: response.data?.data?.bank?.name || 'Titan Trust Bank',
        accountName: response.data?.data?.account_name || (options?.orgName ? `${options.orgName} / Settlement` : 'Verixa ID / Settlement'),
        accountNumber: response.data?.data?.account_number,
      };
    } catch (error: any) {
      this.logger.error('Failed to create DVA', error?.response?.data || error.message);
      const errMsg = error?.response?.data?.message || 'Failed to create Dedicated Virtual Account with Paystack. Please verify customer KYC and live credentials.';
      throw new BadRequestException(errMsg);
    }
  }

  async initializeCheckout(
    email: string,
    amountNgx: number,
    reference: string,
    callbackUrl?: string,
    metadata?: any,
  ): Promise<CheckoutResult> {
    const key = await this.getSecretKey();
    if (!key || key.startsWith('sk_test_mock')) {
      const mockRef = reference || `vrx_mock_${Date.now()}`;
      return {
        authorization_url: `https://checkout.paystack.com/mock_${mockRef}`,
        access_code: `mock_acc_${mockRef}`,
        reference: mockRef,
      };
    }

    try {
      const payload: any = {
        email,
        amount: Math.round(amountNgx * 100), // Convert NGN to kobo
        reference,
      };
      if (callbackUrl) {
        payload.callback_url = callbackUrl;
      }
      if (metadata) {
        payload.metadata = metadata;
      }

      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        payload,
        { headers: { Authorization: `Bearer ${key}` } }
      );

      return {
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference,
      };
    } catch (error: any) {
      this.logger.error('Failed to initialize checkout', error?.response?.data || error.message);
      throw new Error(
        error?.response?.data?.message || 'Paystack checkout initialization failed. Please use your Dedicated Bank Account.'
      );
    }
  }

  async verifyTransaction(reference: string): Promise<VerificationResult | null> {
    const key = await this.getSecretKey();
    if (!key || key.startsWith('sk_test_mock')) {
      return {
        status: 'success',
        reference,
        amount: 50000,
        customerEmail: 'developer@verixa.internal',
        paidAt: new Date().toISOString(),
      };
    }

    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      const data = response.data.data;
      return {
        status: data.status,
        reference: data.reference,
        amount: data.amount / 100, // convert kobo to NGN
        customerEmail: data.customer?.email,
        paidAt: data.paid_at,
      };
    } catch (error: any) {
      this.logger.error(`Failed to verify transaction ${reference}`, error?.response?.data || error.message);
      return null;
    }
  }
  async fetchCustomerTransactions(customerCodeOrEmail: string): Promise<Array<{
    reference: string;
    amount: number;
    status: string;
    channel: string;
    customerEmail?: string;
    paidAt?: string;
  }>> {
    const key = await this.getSecretKey();
    if (!key || key.startsWith('sk_test_mock')) {
      return [];
    }

    try {
      const res = await axios.get(
        `https://api.paystack.co/transaction?customer=${encodeURIComponent(customerCodeOrEmail)}`,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      const items = res.data?.data || [];
      return items.map((d: any) => ({
        reference: d.reference,
        amount: (d.amount || 0) / 100,
        status: d.status,
        channel: d.channel,
        customerEmail: d.customer?.email,
        paidAt: d.paid_at,
      }));
    } catch (err: any) {
      this.logger.warn(`Could not fetch transactions for ${customerCodeOrEmail}: ${err?.response?.data?.message || err.message}`);
      return [];
    }
  }

  async fetchRecentTransactions(perPage = 50): Promise<Array<{
    reference: string;
    amount: number;
    status: string;
    channel: string;
    customerEmail?: string;
    customerCode?: string;
    dvaAccountNumber?: string;
    paidAt?: string;
  }>> {
    const key = await this.getSecretKey();
    if (!key || key.startsWith('sk_test_mock')) {
      return [];
    }

    try {
      const res = await axios.get(
        `https://api.paystack.co/transaction?perPage=${perPage}`,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      const items = res.data?.data || [];
      return items.map((d: any) => ({
        reference: d.reference,
        amount: (d.amount || 0) / 100,
        status: d.status,
        channel: d.channel,
        customerEmail: d.customer?.email,
        customerCode: d.customer?.customer_code,
        dvaAccountNumber: d.dedicated_account?.account_number,
        paidAt: d.paid_at,
      }));
    } catch (err: any) {
      this.logger.warn(`Could not fetch recent transactions: ${err?.response?.data?.message || err.message}`);
      return [];
    }
  }

  async getCustomerDetails(emailOrCode: string): Promise<{ customerCode: string; email: string } | null> {
    const key = await this.getSecretKey();
    if (!key || key.startsWith('sk_test_mock')) {
      return null;
    }

    try {
      const res = await axios.get(
        `https://api.paystack.co/customer/${encodeURIComponent(emailOrCode)}`,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      if (res.data?.data) {
        return {
          customerCode: res.data.data.customer_code,
          email: res.data.data.email,
        };
      }
    } catch {
      // not found
    }
    return null;
  }
}

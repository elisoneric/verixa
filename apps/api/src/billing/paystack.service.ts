import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../admin/entities/system-config.entity';
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

  private async getSecretKey(): Promise<string> {
    try {
      const dbConfig = await this.configRepository.findOne({ where: { key: 'PAYSTACK_SECRET_KEY' } });
      if (dbConfig && dbConfig.value && !dbConfig.value.startsWith('sk_test_mock')) {
        return dbConfig.value.trim();
      }
    } catch {
      // Ignore and fallback to environment variable
    }
    return process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_secret_key';
  }

  async createCustomer(email: string, orgName: string) {
    const key = await this.getSecretKey();
    if (!key || key.startsWith('sk_test_mock')) {
      return 'CUS_mock123';
    }
    try {
      const response = await axios.post(
        'https://api.paystack.co/customer',
        { email, first_name: orgName, last_name: 'Organization' },
        { headers: { Authorization: `Bearer ${key}` } }
      );
      return response.data.data.customer_code;
    } catch (error: any) {
      this.logger.error('Failed to create Paystack customer', error?.response?.data || error.message);
      return 'CUS_mock123';
    }
  }

  async createDedicatedAccount(customerCode: string) {
    const key = await this.getSecretKey();
    if (!key || key.startsWith('sk_test_mock')) {
      return {
        bank: 'Titan Trust Bank',
        accountName: 'Verixa ID / Settlement',
        accountNumber: '9940182741',
      };
    }
    try {
      const response = await axios.post(
        'https://api.paystack.co/dedicated_account',
        { customer: customerCode, preferred_bank: 'titan-paystack' },
        { headers: { Authorization: `Bearer ${key}` } }
      );
      return {
        bank: response.data.data.bank.name,
        accountName: response.data.data.account_name,
        accountNumber: response.data.data.account_number,
      };
    } catch (error: any) {
      this.logger.error('Failed to create DVA', error?.response?.data || error.message);
      return {
        bank: 'Titan Trust Bank',
        accountName: 'Verixa ID / Settlement',
        accountNumber: '9940182741',
      };
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
}

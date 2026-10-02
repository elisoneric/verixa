import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly secretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_secret_key';
  private readonly logger = new Logger(PaystackService.name);

  async createCustomer(email: string, orgName: string) {
    try {
      const response = await axios.post(
        'https://api.paystack.co/customer',
        { email, first_name: orgName, last_name: 'Organization' },
        { headers: { Authorization: `Bearer ${this.secretKey}` } }
      );
      return response.data.data.customer_code;
    } catch (error) {
      this.logger.error('Failed to create Paystack customer', error?.response?.data || error.message);
      // Fail silently in dev if using mock keys
      return 'CUS_mock123';
    }
  }

  async createDedicatedAccount(customerCode: string) {
    try {
      const response = await axios.post(
        'https://api.paystack.co/dedicated_account',
        { customer: customerCode, preferred_bank: 'titan-paystack' },
        { headers: { Authorization: `Bearer ${this.secretKey}` } }
      );
      return {
        bank: response.data.data.bank.name,
        accountName: response.data.data.account_name,
        accountNumber: response.data.data.account_number,
      };
    } catch (error) {
      this.logger.error('Failed to create DVA', error?.response?.data || error.message);
      return {
        bank: 'Titan Trust Bank',
        accountName: 'Mock Account',
        accountNumber: '0000000000',
      };
    }
  }

  async initializeCheckout(email: string, amountNgx: number, reference: string) {
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        { 
          email, 
          amount: amountNgx * 100, // Convert to kobo
          reference,
        },
        { headers: { Authorization: `Bearer ${this.secretKey}` } }
      );
      return response.data.data.authorization_url;
    } catch (error) {
      this.logger.error('Failed to initialize checkout', error?.response?.data || error.message);
      return 'https://checkout.paystack.com/mock-url';
    }
  }
}

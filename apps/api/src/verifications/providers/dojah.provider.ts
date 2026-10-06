import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { 
  IVerificationProvider, 
  BvnVerificationData, 
  NinVerificationData, 
  NinAdvanceVerificationData,
  NinAdvanceResult,
  BankAccountVerificationData, 
  PhoneNumberVerificationData,
  CacVerificationData,
  NubanKycVerificationData,
  SmsDispatchData,
  AirtimePurchaseData,
  DataPurchaseData,
  VerificationResponse 
} from './verification.provider.interface';
import { MockProvider } from './mock.provider';
import { AdminService } from '../../admin/admin.service';

@Injectable()
export class DojahProvider implements IVerificationProvider {
  providerName = 'dojah';
  private readonly logger = new Logger(DojahProvider.name);

  constructor(
    private mockProvider: MockProvider,
    private adminService: AdminService,
  ) {}

  private getCredentials(): { appId: string | null; secretKey: string | null; baseUrl: string } {
    const appId = this.adminService.getConfig('DOJAH_APP_ID') || process.env.DOJAH_APP_ID || null;
    const secretKey = this.adminService.getConfig('DOJAH_SECRET_KEY') || process.env.DOJAH_SECRET_KEY || null;
    const isSandbox = (this.adminService.getConfig('DOJAH_ENVIRONMENT') || process.env.DOJAH_ENVIRONMENT) === 'sandbox';
    const baseUrl = isSandbox ? 'https://sandbox.dojah.io' : 'https://api.dojah.io';
    return { appId, secretKey, baseUrl };
  }

  isConfigured(): boolean {
    const { secretKey } = this.getCredentials();
    return Boolean(secretKey && secretKey.length > 5 && !secretKey.startsWith('sk_test_mock'));
  }

  private getHeaders(secretKey: string, appId: string | null) {
    return {
      Authorization: secretKey, // Note: Dojah requires raw key, not Bearer
      AppId: appId || '',
      'Content-Type': 'application/json',
    };
  }

  // --- 1. BVN Lookups ---

  async verifyBvn(data: BvnVerificationData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      this.logger.log('Dojah credentials not live, falling back to mock provider for BVN');
      return this.mockProvider.verifyBvn(data);
    }

    try {
      let endpoint = `${baseUrl}/api/v1/kyc/bvn/full`;
      const params: any = { bvn: data.bvn };

      if (data.variant === 'match') {
        endpoint = `${baseUrl}/api/v1/kyc/bvn`;
        if (data.firstName) params.first_name = data.firstName;
        if (data.lastName) params.last_name = data.lastName;
        if (data.dob) params.dob = data.dob;
      } else if (data.variant === 'advance') {
        endpoint = `${baseUrl}/api/v1/kyc/bvn/advance`;
      }

      const response = await axios.get(endpoint, {
        params,
        headers: this.getHeaders(secretKey!, appId),
        timeout: 15000,
      });

      const entity = response.data?.entity || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'dojah',
          reference: `dojah_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Dojah BVN lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  // --- 2. NIN Lookups ---

  async verifyNin(data: NinVerificationData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      this.logger.log('Dojah credentials not live, falling back to mock provider for NIN');
      return this.mockProvider.verifyNin(data);
    }

    try {
      let endpoint = `${baseUrl}/api/v1/kyc/nin`;
      if (data.tier === 'advance') {
        return this.verifyNinAdvance({ nin: data.nin, consent: data.consent });
      } else if (data.tier === 'premium') {
        endpoint = `${baseUrl}/api/v1/kyc/nin/premium`;
      } else if (data.tier === 'slip') {
        endpoint = `${baseUrl}/api/v1/kyc/nin/nin_slip`;
      }

      const response = await axios.get(endpoint, {
        params: { nin: data.nin },
        headers: this.getHeaders(secretKey!, appId),
        timeout: 15000,
      });

      const entity = response.data?.entity || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'dojah',
          reference: `dojah_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Dojah NIN lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async verifyNinAdvance(data: NinAdvanceVerificationData): Promise<VerificationResponse<NinAdvanceResult>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      this.logger.log('Dojah credentials not live, falling back to mock provider for NIN Advance');
      return this.mockProvider.verifyNinAdvance(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/kyc/nin/advance`, {
        params: { nin: data.nin },
        headers: this.getHeaders(secretKey!, appId),
        timeout: 18000,
      });

      const entity = response.data?.entity || {};
      const trackingId = entity.tracking_id || entity.trackingId || '';

      let photoStr = entity.photo || '';
      if (photoStr.includes('base64,')) {
        photoStr = photoStr.split('base64,')[1];
      }

      return {
        status: 'success',
        data: {
          nin: data.nin,
          trackingId,
          firstName: entity.firstname || entity.first_name || '',
          surname: entity.surname || entity.last_name || '',
          middleName: entity.middlename || entity.middle_name || '',
          gender: (entity.gender || 'MALE').toUpperCase(),
          birthdate: entity.birthdate || entity.date_of_birth || entity.dob || '',
          address: entity.residence_address_line_1 || entity.residence_address || entity.address || '',
          addressLine1: entity.residence_address_line_1 || entity.residence_town || '',
          state: entity.residence_state || entity.birth_state || entity.state || '',
          lga: entity.residence_lga || entity.birth_lga || entity.lga || '',
          phoneNumber: entity.telephoneno || entity.phone_number || '',
          photo: photoStr,
          signature: entity.signature || '',
          nextOfKin: entity.nok_first_name ? {
            firstName: entity.nok_first_name,
            middleName: entity.nok_middle_name,
            lastName: entity.nok_last_name,
            town: entity.nok_town,
            lga: entity.nok_lga,
            address: entity.nok_address_line_1,
          } : undefined,
        },
        meta: {
          provider: 'dojah',
          reference: `dojah_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Dojah NIN Advance lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  // --- 3. Bank Account & NUBAN ---

  async verifyBankAccount(data: BankAccountVerificationData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.verifyBankAccount(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/kyc/account`, {
        params: {
          account_number: data.accountNumber,
          bank_code: data.bankCode,
        },
        headers: this.getHeaders(secretKey!, appId),
        timeout: 12000,
      });

      const entity = response.data?.entity || {};
      return {
        status: 'success',
        data: {
          account_name: entity.account_name,
          account_number: data.accountNumber,
          bank_code: data.bankCode,
        },
        meta: {
          provider: 'dojah',
          reference: `dojah_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Dojah NUBAN lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async verifyNubanKycStatus(data: NubanKycVerificationData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.verifyNubanKycStatus!(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/kyc/nuban/status`, {
        params: {
          account_number: data.accountNumber,
          bank_code: data.bankCode,
        },
        headers: this.getHeaders(secretKey!, appId),
        timeout: 15000,
      });

      const entity = response.data?.entity || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'dojah',
          reference: `dojah_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Dojah NUBAN KYC status lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  // --- 4. Phone Number Lookup ---

  async verifyPhoneNumber(data: PhoneNumberVerificationData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.verifyPhoneNumber!(data);
    }

    try {
      const endpoint = data.variant === 'advance'
        ? `${baseUrl}/api/v1/kyc/phone_number`
        : `${baseUrl}/api/v1/kyc/phone_number/basic`;

      const response = await axios.get(endpoint, {
        params: { phone_number: data.phoneNumber },
        headers: this.getHeaders(secretKey!, appId),
        timeout: 15000,
      });

      const entity = response.data?.entity || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'dojah',
          reference: `dojah_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Dojah Phone lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  // --- 5. Business Verification (CAC & TIN) ---

  async verifyCac(data: CacVerificationData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.verifyCac!(data);
    }

    try {
      let endpoint = `${baseUrl}/api/v1/kyc/cac/basic`;
      if (data.variant === 'advance') {
        endpoint = `${baseUrl}/api/v1/kyc/cac/advance`;
      } else if (data.variant === 'tin') {
        endpoint = `${baseUrl}/api/v1/kyc/cac/tin`;
      }

      const response = await axios.get(endpoint, {
        params: {
          rc_number: data.rcNumber,
          company_type: data.companyType || 'COMPANY',
        },
        headers: this.getHeaders(secretKey!, appId),
        timeout: 18000,
      });

      const entity = response.data?.entity || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'dojah',
          reference: `dojah_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Dojah CAC lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  // --- 6. Messaging (SMS / WhatsApp) ---

  async sendSms(data: SmsDispatchData): Promise<any> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.sendSms!(data);
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/messaging/sms`,
        {
          destination: data.destination,
          message: data.message,
          channel: data.channel || 'sms',
          sender_id: data.senderId || 'Verixa',
          priority: data.priority || false,
        },
        { headers: this.getHeaders(secretKey!, appId), timeout: 12000 }
      );
      return response.data?.entity || response.data;
    } catch (err: any) {
      this.logger.error(`Dojah SMS send error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  // --- 7. Airtime & Data ---

  async purchaseAirtime(data: AirtimePurchaseData): Promise<any> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.purchaseAirtime!(data);
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/purchase/airtime`,
        {
          amount: data.amount,
          destination: Array.isArray(data.destination) ? data.destination : [data.destination],
        },
        { headers: this.getHeaders(secretKey!, appId), timeout: 15000 }
      );
      return response.data?.entity || response.data;
    } catch (err: any) {
      this.logger.error(`Dojah Airtime purchase error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async purchaseData(data: DataPurchaseData): Promise<any> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.purchaseData!(data);
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/purchase/data`,
        {
          plan: data.plan,
          destination: data.destination,
        },
        { headers: this.getHeaders(secretKey!, appId), timeout: 15000 }
      );
      return response.data?.entity || response.data;
    } catch (err: any) {
      this.logger.error(`Dojah Data purchase error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async getDataPlans(): Promise<any[]> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.getDataPlans!();
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/purchase/data/plans`, {
        headers: this.getHeaders(secretKey!, appId),
        timeout: 10000,
      });
      return response.data?.entity || [];
    } catch (err: any) {
      this.logger.error(`Dojah Data Plans fetch error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  // --- 8. Upstream Dojah Balance Health Check ---

  async getUpstreamBalance(): Promise<{ balance: string; currency: string }> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return { balance: '500,000.00', currency: 'NGN' };
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/balance`, {
        headers: this.getHeaders(secretKey!, appId),
        timeout: 10000,
      });
      const balance = response.data?.entity?.wallet_balance || '0.00';
      return { balance, currency: 'NGN' };
    } catch (err: any) {
      this.logger.error(`Dojah balance error: ${err?.message}`, err?.response?.data);
      return { balance: 'Unavailable', currency: 'NGN' };
    }
  }
}

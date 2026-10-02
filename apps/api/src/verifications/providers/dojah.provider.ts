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
    const { appId, secretKey } = this.getCredentials();
    return Boolean(secretKey && secretKey.length > 5);
  }

  async verifyBvn(data: BvnVerificationData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!secretKey) {
      if (process.env.NODE_ENV === 'production' && !baseUrl.includes('sandbox')) {
        throw new Error('Live Dojah credentials (DOJAH_SECRET_KEY) are not configured.');
      }
      this.logger.log('Dojah sandbox fallback to mock provider for BVN');
      return this.mockProvider.verifyBvn(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/kyc/bvn`, {
        params: { bvn: data.bvn, consent: true },
        headers: {
          Authorization: secretKey,
          AppId: appId || '',
        },
        timeout: 12000,
      });

      const entity = response.data?.entity || {};
      return {
        status: 'success',
        data: {
          bvn: data.bvn,
          first_name: entity.first_name || entity.firstname,
          last_name: entity.last_name || entity.surname,
          date_of_birth: entity.date_of_birth || entity.dob,
          phone_number: entity.phone_number || entity.phone,
        },
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

  async verifyNin(data: NinVerificationData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!secretKey) {
      if (process.env.NODE_ENV === 'production' && !baseUrl.includes('sandbox')) {
        throw new Error('Live Dojah credentials (DOJAH_SECRET_KEY) are not configured.');
      }
      this.logger.log('Dojah sandbox fallback to mock provider for NIN Basic');
      return this.mockProvider.verifyNin(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/kyc/nin`, {
        params: { nin: data.nin, consent: true },
        headers: {
          Authorization: secretKey,
          AppId: appId || '',
        },
        timeout: 12000,
      });

      const entity = response.data?.entity || {};
      return {
        status: 'success',
        data: {
          nin: data.nin,
          first_name: entity.firstname || entity.first_name,
          last_name: entity.surname || entity.last_name,
          gender: entity.gender,
          birthdate: entity.birthdate,
        },
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
    if (!secretKey) {
      if (process.env.NODE_ENV === 'production' && !baseUrl.includes('sandbox')) {
        throw new Error('Live Dojah credentials (DOJAH_SECRET_KEY) are not configured.');
      }
      this.logger.log('Dojah sandbox fallback to mock provider for NIN Advance');
      return this.mockProvider.verifyNinAdvance(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/kyc/nin/advance`, {
        params: { nin: data.nin, consent: true },
        headers: {
          Authorization: secretKey,
          AppId: appId || '',
        },
        timeout: 15000,
      });

      const entity = response.data?.entity || {};
      const trackingId = entity.tracking_id || entity.trackingId || '';

      // Clean photo string (strip data:image... prefix if present for raw base64 or keep format)
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
          birthdate: entity.birthdate || entity.dob || '',
          address: entity.residence_address || entity.address || '',
          addressLine1: entity.residence_lga ? `${entity.residence_lga}, ${entity.residence_state || ''}` : (entity.residence_state || ''),
          state: entity.residence_state || entity.state || '',
          lga: entity.residence_lga || entity.lga || '',
          phoneNumber: entity.telephoneno || entity.phone_number || '',
          photo: photoStr,
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

  async verifyBankAccount(data: BankAccountVerificationData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!secretKey) {
      if (process.env.NODE_ENV === 'production' && !baseUrl.includes('sandbox')) {
        throw new Error('Live Dojah credentials (DOJAH_SECRET_KEY) are not configured.');
      }
      return this.mockProvider.verifyBankAccount(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/kyc/account`, {
        params: {
          account_number: data.accountNumber,
          bank_code: data.bankCode,
          consent: true,
        },
        headers: {
          Authorization: secretKey,
          AppId: appId || '',
        },
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
}


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
  TinVerificationData,
  DriversLicenseVerificationData,
  VotersCardVerificationData,
  PassportVerificationData,
  CreditScoreData,
  FaceMatchData,
  AmlScreeningData,
  PhoneIntelligenceData,
  EmailRiskData,
  NubanKycVerificationData,
  SmsDispatchData,
  AirtimePurchaseData,
  DataPurchaseData,
  VerificationResponse 
} from './verification.provider.interface';
import { MockProvider } from './mock.provider';
import { AdminService } from '../../admin/admin.service';
import { decryptSecret } from '../../common/utils/crypto.util';
import { generatePdfSlip, generateDocxSlip, generateDigitalNinCardPdf, generateDigitalNinCardSvg } from '../../slips/slip-generator.util';

@Injectable()
export class DojahProvider implements IVerificationProvider {
  providerName = 'direct';
  private readonly logger = new Logger(DojahProvider.name);

  constructor(
    private mockProvider: MockProvider,
    private adminService: AdminService,
  ) {}

  private getCredentials(): { appId: string | null; secretKey: string | null; baseUrl: string } {
    const appId =
      this.adminService.getConfig('DOJAH_APP_ID') ||
      this.adminService.getConfig('vx_APP_ID') ||
      process.env.DOJAH_APP_ID ||
      process.env.vx_APP_ID ||
      null;
    const secretKey =
      this.adminService.getConfig('DOJAH_SECRET_KEY') ||
      this.adminService.getConfig('vx_SECRET_KEY') ||
      process.env.DOJAH_SECRET_KEY ||
      process.env.vx_SECRET_KEY ||
      null;
    const envVal =
      this.adminService.getConfig('DOJAH_ENVIRONMENT') ||
      this.adminService.getConfig('vx_ENVIRONMENT') ||
      process.env.DOJAH_ENVIRONMENT ||
      process.env.vx_ENVIRONMENT;
    const isSandbox = envVal === 'sandbox';
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
    const cleanBvn = String(data.bvn || '').trim();
    if (cleanBvn === '22222222222' || cleanBvn === '00000000000' || cleanBvn === '22123456789') {
      this.logger.log(`DojahProvider: Sandbox test BVN ${cleanBvn} detected; routing to mock provider to prevent live upstream charges.`);
      return this.mockProvider.verifyBvn(data);
    }

    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      this.logger.log('Dojah credentials not live, falling back to mock provider for BVN');
      return this.mockProvider.verifyBvn(data);
    }

    try {
      // Default to straight BVN lookup /api/v1/kyc/bvn?bvn=...
      let endpoint = `${baseUrl}/api/v1/kyc/bvn`;
      const params: any = { bvn: data.bvn };

      if (data.variant === 'full') {
        endpoint = `${baseUrl}/api/v1/kyc/bvn/full`;
      } else if (data.variant === 'advance') {
        endpoint = `${baseUrl}/api/v1/kyc/bvn/advance`;
      } else if (data.variant === 'match') {
        endpoint = `${baseUrl}/api/v1/kyc/bvn`;
        if (data.firstName) params.first_name = data.firstName;
        if (data.lastName) params.last_name = data.lastName;
        if (data.dob) params.dob = data.dob;
      }

      let response: any;
      try {
        response = await axios.get(endpoint, {
          params,
          headers: this.getHeaders(secretKey!, appId),
          timeout: 15000,
        });
      } catch (err: any) {
        // Resilient fallback: If /full or /advance fails, query straight /api/v1/kyc/bvn
        if (endpoint !== `${baseUrl}/api/v1/kyc/bvn`) {
          this.logger.warn(`Dojah BVN variant ${data.variant} failed, retrying straight /api/v1/kyc/bvn...`);
          response = await axios.get(`${baseUrl}/api/v1/kyc/bvn`, {
            params: { bvn: data.bvn },
            headers: this.getHeaders(secretKey!, appId),
            timeout: 15000,
          });
        } else {
          throw err;
        }
      }

      const entity = response.data?.entity || response.data?.data || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Dojah BVN lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  // --- 2. NIN Lookups ---

  async verifyNin(data: NinVerificationData): Promise<VerificationResponse<any>> {
    const cleanNin = String(data.nin || '').trim();
    if (cleanNin === '70123456789' || cleanNin === '00000000000' || cleanNin === '11234567890') {
      this.logger.log(`DojahProvider: Sandbox test NIN ${cleanNin} detected; routing to mock provider to prevent live upstream charges.`);
      return this.mockProvider.verifyNin(data);
    }

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

      // If Dojah live NDPC call returns all fields but nin_id is not yet populated, synthesize it from slip template
      if (data.tier === 'slip' && !entity.nin_id && (entity.first_name || entity.firstname)) {
        try {
          const pdfBuf = await generatePdfSlip({
            nin: data.nin,
            trackingId: entity.tracking_id || entity.trackingId,
            firstName: entity.first_name || entity.firstname,
            surname: entity.last_name || entity.surname,
            middleName: entity.middle_name || entity.middlename,
            gender: entity.gender,
            address: entity.residence_address_line_1 || entity.residence_address || entity.address,
            addressLine1: entity.residence_lga || entity.residence_town || entity.addressLine1,
            state: entity.residence_state || entity.birth_state || entity.state,
            photo: entity.photo,
          });
          entity.nin_id = pdfBuf.toString('base64');
        } catch (e: any) {
          this.logger.warn(`Could not generate fallback slip PDF: ${e?.message}`);
        }
      }

      // Generate corresponding single-slip Word DOCX from authentic Dojah citizen attributes
      if (data.tier === 'slip' && (entity.first_name || entity.firstname)) {
        try {
          const docxBuf = await generateDocxSlip({
            nin: data.nin,
            trackingId: entity.tracking_id || entity.trackingId || entity.nin,
            firstName: entity.first_name || entity.firstname,
            surname: entity.last_name || entity.surname,
            middleName: entity.middle_name || entity.middlename,
            gender: entity.gender,
            address: entity.residence_address_line_1 || entity.residence_address || entity.address,
            addressLine1: entity.residence_lga || entity.residence_town || entity.addressLine1 || '',
            state: entity.residence_state || entity.birth_state || entity.state || '',
            photo: entity.photo,
          });
          entity.docxBase64 = docxBuf.toString('base64');
        } catch (e: any) {
          this.logger.warn(`Could not generate slip DOCX: ${e?.message}`);
        }
      }

      // Generate corresponding Digital NIN Card (ID-1 Format without address)
      if (data.tier === 'slip' && (entity.first_name || entity.firstname)) {
        try {
          const cardBuf = await generateDigitalNinCardPdf({
            nin: data.nin,
            trackingId: entity.tracking_id || entity.trackingId || entity.nin,
            firstName: entity.first_name || entity.firstname,
            surname: entity.last_name || entity.surname,
            middleName: entity.middle_name || entity.middlename,
            gender: entity.gender,
            birthdate: entity.date_of_birth || entity.dob || entity.birthdate,
            photo: entity.photo,
          });
          entity.cardPdfBase64 = cardBuf.toString('base64');
          entity.cardSvg = await generateDigitalNinCardSvg({
            nin: data.nin,
            trackingId: entity.tracking_id || entity.trackingId || entity.nin,
            firstName: entity.first_name || entity.firstname,
            surname: entity.last_name || entity.surname,
            middleName: entity.middle_name || entity.middlename,
            gender: entity.gender,
            birthdate: entity.date_of_birth || entity.dob || entity.birthdate,
            photo: entity.photo,
          });
        } catch (e: any) {
          this.logger.warn(`Could not generate Digital NIN Card: ${e?.message}`);
        }
      }

      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Dojah NIN lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async verifyNinAdvance(data: NinAdvanceVerificationData): Promise<VerificationResponse<NinAdvanceResult>> {
    const cleanNin = String(data.nin || '').trim();
    if (cleanNin === '70123456789' || cleanNin === '00000000000' || cleanNin === '11234567890') {
      this.logger.log(`DojahProvider: Sandbox test NIN ${cleanNin} detected in advance query; routing to mock provider.`);
      return this.mockProvider.verifyNinAdvance(data);
    }

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
          ...entity,
          nin: data.nin,
          trackingId,
          tracking_id: trackingId,
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
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
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
      let entity: any = null;
      try {
        const response = await axios.get(`${baseUrl}/api/v1/kyc/account`, {
          params: {
            account_number: data.accountNumber,
            bank_code: data.bankCode,
          },
          headers: this.getHeaders(secretKey!, appId),
          timeout: 12000,
        });
        entity = response.data?.entity || response.data?.data || {};
      } catch (dojahErr: any) {
        this.logger.warn(`Dojah NUBAN lookup failed: ${dojahErr?.message}. Resiliently falling back to Paystack bank resolve...`);
        const paystackKey =
          this.adminService.getConfig('PAYSTACK_SECRET_KEY') ||
          process.env.PAYSTACK_SECRET_KEY;
        if (paystackKey && !paystackKey.startsWith('sk_test_mock')) {
          const decryptedKey = paystackKey.includes(':') ? decryptSecret(paystackKey) : paystackKey;
          const paystackRes = await axios.get('https://api.paystack.co/bank/resolve', {
            params: {
              account_number: data.accountNumber,
              bank_code: data.bankCode,
            },
            headers: { Authorization: `Bearer ${decryptedKey.trim()}` },
            timeout: 10000,
          });
          const pData = paystackRes.data?.data || {};
          entity = {
            account_name: pData.account_name,
            account_number: pData.account_number || data.accountNumber,
            bank_code: data.bankCode,
            bank_id: pData.bank_id,
          };
        } else {
          throw dojahErr;
        }
      }

      return {
        status: 'success',
        data: {
          account_name: entity.account_name,
          account_number: data.accountNumber,
          bank_code: data.bankCode,
        },
        meta: {
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`NUBAN resolution error: ${err?.message}`, err?.response?.data);
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
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Dojah NUBAN KYC status lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  // --- 4. Phone Number Lookup ---

  async verifyPhoneNumber(data: PhoneNumberVerificationData): Promise<VerificationResponse<any>> {
    const cleanPhone = String(data.phoneNumber || '').trim();
    if (cleanPhone === '09011111111' || cleanPhone === '2349011111111' || cleanPhone.endsWith('011111111')) {
      this.logger.log(`DojahProvider: Sandbox test Phone ${cleanPhone} detected; routing to mock provider.`);
      return this.mockProvider.verifyPhoneNumber!(data);
    }

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
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
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
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Upstream CAC lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async verifyTin(data: TinVerificationData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.verifyTin!(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/kyc/tin`, {
        params: { tin: data.tin },
        headers: this.getHeaders(secretKey!, appId),
        timeout: 15000,
      });

      const entity = response.data?.entity || response.data || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Upstream TIN lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async verifyDriversLicense(data: DriversLicenseVerificationData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.verifyDriversLicense!(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/kyc/dl`, {
        params: { license_number: data.licenseNumber, dob: data.dob },
        headers: this.getHeaders(secretKey!, appId),
        timeout: 18000,
      });

      const entity = response.data?.entity || response.data || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Upstream Driver's License lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async verifyVotersCard(data: VotersCardVerificationData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.verifyVotersCard!(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/kyc/vin`, {
        params: { vin: data.vin, state: data.state, last_name: data.lastName },
        headers: this.getHeaders(secretKey!, appId),
        timeout: 18000,
      });

      const entity = response.data?.entity || response.data || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Upstream Voter's Card lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async verifyPassport(data: PassportVerificationData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.verifyPassport!(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/kyc/passport`, {
        params: { passport_number: data.passportNumber, last_name: data.lastName, dob: data.dob },
        headers: this.getHeaders(secretKey!, appId),
        timeout: 20000,
      });

      const entity = response.data?.entity || response.data || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Upstream Passport lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async getCreditScore(data: CreditScoreData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.getCreditScore!(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/credit/bvn`, {
        params: { bvn: data.bvn, phone_number: data.phoneNumber },
        headers: this.getHeaders(secretKey!, appId),
        timeout: 25000,
      });

      const entity = response.data?.entity || response.data || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Upstream Credit Score lookup error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async verifyFaceMatch(data: FaceMatchData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.verifyFaceMatch!(data);
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/kyc/photoid/verify`,
        {
          id_type: data.idType,
          id_number: data.idNumber,
          image: data.selfieImageBase64,
        },
        { headers: this.getHeaders(secretKey!, appId), timeout: 25000 }
      );

      const entity = response.data?.entity || response.data || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Upstream Face Match error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async screenAml(data: AmlScreeningData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.screenAml!(data);
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/aml/screening`,
        {
          name: data.name,
          date_of_birth: data.dob,
          country: data.country || 'NG',
        },
        { headers: this.getHeaders(secretKey!, appId), timeout: 20000 }
      );

      const entity = response.data?.entity || response.data || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Upstream AML Screening error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async screenPhoneIntelligence(data: PhoneIntelligenceData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.screenPhoneIntelligence!(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/kyc/phone_number`, {
        params: { phone_number: data.phoneNumber },
        headers: this.getHeaders(secretKey!, appId),
        timeout: 18000,
      });

      const entity = response.data?.entity || response.data || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Upstream Phone Intelligence error: ${err?.message}`, err?.response?.data);
      throw err;
    }
  }

  async checkEmailRisk(data: EmailRiskData): Promise<VerificationResponse<any>> {
    const { appId, secretKey, baseUrl } = this.getCredentials();
    if (!this.isConfigured()) {
      return this.mockProvider.checkEmailRisk!(data);
    }

    try {
      const response = await axios.get(`${baseUrl}/api/v1/kyc/email`, {
        params: { email: data.email },
        headers: this.getHeaders(secretKey!, appId),
        timeout: 15000,
      });

      const entity = response.data?.entity || response.data || {};
      return {
        status: 'success',
        data: entity,
        meta: {
          provider: 'direct',
          reference: `vx_${uuidv4().slice(0, 12)}`,
        },
      };
    } catch (err: any) {
      this.logger.error(`Upstream Email Risk error: ${err?.message}`, err?.response?.data);
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

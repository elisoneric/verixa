import { Injectable } from '@nestjs/common';
import { 
  IVerificationProvider, 
  BvnVerificationData, 
  NinVerificationData, 
  BankAccountVerificationData, 
  PhoneNumberVerificationData,
  CacVerificationData,
  NubanKycVerificationData,
  SmsDispatchData,
  AirtimePurchaseData,
  DataPurchaseData,
  VerificationResponse 
} from './verification.provider.interface';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker/locale/en_NG';

@Injectable()
export class MockProvider implements IVerificationProvider {
  providerName = 'verixa_mock';

  async verifyBvn(data: BvnVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 350));

    if (data.bvn === '00000000000') {
      return {
        status: 'failed',
        meta: { provider: this.providerName, reference: uuidv4() },
      };
    }

    if (data.variant === 'match') {
      return {
        status: 'success',
        data: {
          bvn: { value: `${data.bvn.slice(0, 1)}*****${data.bvn.slice(-5)}`, status: true },
          first_name: { confidence_value: 100, status: true },
          last_name: { confidence_value: 100, status: true },
        },
        meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
      };
    }

    const firstName = data.firstName?.toUpperCase() || faker.person.firstName().toUpperCase();
    const lastName = data.lastName?.toUpperCase() || faker.person.lastName().toUpperCase();
    const phoneNumber = `0${faker.string.numeric(10)}`;

    return {
      status: 'success',
      data: {
        bvn: `${data.bvn.slice(0, 1)}*****${data.bvn.slice(-5)}`,
        first_name: firstName,
        last_name: lastName,
        middle_name: 'CHUKWUEMEKA',
        date_of_birth: data.dob || '1992-05-16',
        phone_number1: phoneNumber,
        gender: 'Male',
        enrollment_bank: 'GTB',
        enrollment_branch: 'IKEJA',
        level_of_account: 'LEVEL 3',
        nationality: 'NIGERIAN',
        state_of_origin: 'LAGOS',
        lga_of_origin: 'IKEJA',
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyNin(data: NinVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    if (data.nin === '00000000000') {
      return {
        status: 'failed',
        meta: { provider: this.providerName, reference: uuidv4() },
      };
    }

    if (data.tier === 'advance' || data.tier === 'premium' || data.tier === 'slip') {
      return this.verifyNinAdvance({ nin: data.nin });
    }

    const firstName = data.firstName?.toUpperCase() || faker.person.firstName().toUpperCase();
    const lastName = data.lastName?.toUpperCase() || faker.person.lastName().toUpperCase();

    return {
      status: 'success',
      data: {
        nin: data.nin,
        first_name: firstName,
        last_name: lastName,
        middle_name: 'BABATUNDE',
        gender: 'Male',
        date_of_birth: '1990-08-14',
        phone_number: `080${faker.string.numeric(8)}`,
        employment_status: 'Employed',
        marital_status: 'Single',
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyNinAdvance(data: { nin: string }): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 400));

    if (data.nin === '00000000000') {
      return {
        status: 'failed',
        meta: { provider: this.providerName, reference: uuidv4() },
      };
    }

    const firstNames = ['BABATUNDE', 'CHUKWUDI', 'OLUMIDE', 'EMMANUEL', 'IBRAHIM', 'CHINEDU', 'TEMITOPE', 'ZAINAB', 'NGOZI', 'AISHA'];
    const surnames = ['ADEBAYO', 'OKONKWO', 'BALOGUN', 'BELLO', 'EZE', 'DANJUMA', 'OGUNLEWE', 'ABUBAKAR', 'NWOSU', 'SANUSI'];
    const middleNames = ['OLUWASEUN', 'SOMTOCHUKWU', 'AYOMIDE', 'IFEANYI', 'DAUDA', 'CHIDIEBERE', 'ENIOLA', 'YAKUBU', 'OLATUNJI'];

    const seed = data.nin.split('').reduce((acc, c) => acc + parseInt(c, 10) || 0, 0);
    const firstName = firstNames[seed % firstNames.length];
    const surname = surnames[(seed + 3) % surnames.length];
    const middleName = middleNames[(seed + 5) % middleNames.length];
    const gender = seed % 2 === 0 ? 'MALE' : 'FEMALE';

    const trackid = `VNX-${faker.string.numeric(4)}-${faker.string.numeric(4)}-${faker.string.numeric(4)}`;

    let photoBase64 = '';
    try {
      const fs = require('fs');
      const path = require('path');
      const photoPath = path.resolve(__dirname, '../../slips/assets/default_mock_photo.jpg');
      if (fs.existsSync(photoPath)) {
        photoBase64 = fs.readFileSync(photoPath).toString('base64');
      }
    } catch {
      photoBase64 = '';
    }

    return {
      status: 'success',
      data: {
        nin: data.nin,
        trackingId: trackid,
        firstName,
        surname,
        middleName,
        gender,
        birthdate: '1994-08-16',
        address: '14 ADENIRAN OGUNSANYA STREET',
        addressLine1: 'SURULERE, IKEJA LGA',
        state: 'LAGOS STATE',
        lga: 'SURULERE',
        phoneNumber: `080${faker.string.numeric(8)}`,
        photo: photoBase64,
        nextOfKin: {
          firstName: 'FOLAKE',
          middleName: 'ESTHER',
          lastName: surname,
          town: 'SURULERE',
          lga: 'SURULERE',
          address: '14 ADENIRAN OGUNSANYA STREET',
        },
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyBankAccount(data: BankAccountVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 350));

    if (data.accountNumber === '0000000000') {
      return {
        status: 'failed',
        meta: { provider: this.providerName, reference: uuidv4() },
      };
    }

    const firstName = faker.person.firstName().toUpperCase();
    const lastName = faker.person.lastName().toUpperCase();

    return {
      status: 'success',
      data: {
        account_name: `${firstName} ${lastName}`,
        account_number: data.accountNumber,
        bank_code: data.bankCode,
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyNubanKycStatus(data: NubanKycVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 350));

    return {
      status: 'success',
      data: {
        account_currency: 'NGN',
        account_name: 'CHIDERA EMMANUEL OKAFOR',
        account_number: `${data.accountNumber.slice(0, 3)}****${data.accountNumber.slice(-3)}`,
        bank: 'GUARANTY TRUST BANK (GTB)',
        kyc_status: '3',
        first_name: 'CHIDERA',
        last_name: 'OKAFOR',
        other_names: 'EMMANUEL',
        identity_type: 'BVN',
        identity_number: '22*******19',
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyPhoneNumber(data: PhoneNumberVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      status: 'success',
      data: {
        first_name: 'OLUWATOBI',
        middle_name: 'SAMUEL',
        last_name: 'ADELEKE',
        gender: 'Male',
        nationality: 'NGA',
        date_of_birth: '1991-04-12',
        msisdn: data.phoneNumber.startsWith('234') ? data.phoneNumber : `234${data.phoneNumber.replace(/^0/, '')}`,
        photo: data.variant === 'advance' ? 'data:image/jpeg;base64,mockphoto' : undefined,
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyCac(data: CacVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 400));

    if (data.variant === 'tin') {
      return {
        status: 'success',
        data: {
          company_name: 'VERIXA TECH ENTERPRISES LIMITED',
          tax_id: '198472910481',
          company_type: data.companyType || 'COMPANY',
          rc_number: data.rcNumber,
        },
        meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
      };
    }

    return {
      status: 'success',
      data: {
        company_name: 'VERIXA TECH ENTERPRISES LIMITED',
        rc_number: data.rcNumber,
        business_number: data.rcNumber,
        type_of_company: data.companyType || 'COMPANY',
        status: 'Active',
        date_of_registration: '2021-03-15T09:00:00.000Z',
        address: '15 PLOT 4, COMMERCIAL AVENUE, VICTORIA ISLAND',
        state: 'Lagos',
        city: 'Lagos Island',
        lga: 'Eti-Osa',
        affiliates: data.variant === 'advance' ? [
          {
            first_name: 'EMMANUEL',
            last_name: 'BALOGUN',
            affiliate_type: 'DIRECTOR',
            gender: 'MALE',
            phone_number: '+2348039281741',
            nationality: 'Nigerian',
          },
          {
            first_name: 'CHIDINMA',
            last_name: 'OKONKWO',
            affiliate_type: 'SHAREHOLDER',
            gender: 'FEMALE',
            phone_number: '+2348123984712',
            nationality: 'Nigerian',
          }
        ] : undefined,
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async sendSms(data: SmsDispatchData): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return {
      status: 'Sent',
      mobile: data.destination,
      message_id: `dj_${uuidv4().replace(/-/g, '')}`,
      reference_id: `ref_${uuidv4().replace(/-/g, '')}`,
    };
  }

  async purchaseAirtime(data: AirtimePurchaseData): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 350));
    return {
      status: 'Sent',
      mobile: Array.isArray(data.destination) ? data.destination[0] : data.destination,
      amount: `NGN ${data.amount}.00`,
      reference_id: `air_${uuidv4().replace(/-/g, '')}`,
    };
  }

  async purchaseData(data: DataPurchaseData): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      phone_number: data.destination,
      plan: data.plan,
      amount: 1000,
      network: 'MTN NIGERIA 1.5GB',
      reference_id: `dat_${uuidv4().replace(/-/g, '')}`,
    };
  }

  async getDataPlans(): Promise<any[]> {
    return [
      { amount: 500, description: 'MTN 1GB 30 Days Bundle', plan: 'MTN_1GB' },
      { amount: 1000, description: 'MTN 2.5GB 30 Days Bundle', plan: 'MTN_2.5GB' },
      { amount: 1500, description: 'AIRTEL 3GB Monthly Plan', plan: 'AIRTEL_3GB' },
      { amount: 2000, description: 'GLO 5.5GB Monthly Plan', plan: 'GLO_5.5GB' },
      { amount: 1200, description: '9MOBILE 2GB Monthly Plan', plan: '9MOBILE_2GB' },
    ];
  }

  async getUpstreamBalance(): Promise<{ balance: string; currency: string }> {
    return { balance: '500,000.00', currency: 'NGN' };
  }
}
